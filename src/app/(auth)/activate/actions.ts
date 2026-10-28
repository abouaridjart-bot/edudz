"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { newPasswordProblem } from "@/lib/password-policy";

const schema = z.object({
  token: z.string().trim().min(16, "رابط التفعيل غير صالح"),
  password: z.string().min(1, "كلمة المرور مطلوبة"),
  confirm: z.string().min(1, "تأكيد كلمة المرور مطلوب"),
});

class ActivationError extends Error {}

function fail(token: string, message: string): never {
  redirect(`/activate?token=${encodeURIComponent(token)}&error=${encodeURIComponent(message)}`);
}

/**
 * تفعيل حساب مدعوّ: يتحقق من رمز الدعوة (لمرة واحدة، وصلاحية 72 ساعة)،
 * يضبط كلمة المرور، يفعّل الحساب، ويسجّل العملية في AuditLog.
 * لا يحتاج جلسة: من يملك الرابط هو صاحب الحساب.
 */
export async function activateAccount(formData: FormData): Promise<void> {
  const rawToken = String(formData.get("token") ?? "");
  const parsed = schema.safeParse({
    token: rawToken,
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) {
    fail(rawToken, parsed.error.issues[0]?.message ?? "بيانات غير صالحة");
  }

  const { token, password, confirm } = parsed.data;
  const problem = newPasswordProblem(password, confirm);
  if (problem) fail(token, problem);

  const invitation = await db.invitation.findUnique({ where: { token } });
  if (!invitation) fail(token, "رابط التفعيل غير صالح");
  if (invitation.acceptedAt) fail(token, "استُعمل هذا الرابط مسبقاً");
  if (invitation.expiresAt < new Date()) fail(token, "انتهت صلاحية رابط التفعيل، اطلب دعوة جديدة");
  if (!invitation.email) fail(token, "الدعوة بلا بريد إلكتروني");

  const user = await db.user.findFirst({
    where: {
      email: invitation.email,
      ...(invitation.centerId ? { centerId: invitation.centerId } : {}),
    },
    select: { id: true, role: true, centerId: true, isActive: true },
  });
  if (!user) fail(token, "لا يوجد حساب مرتبط بهذه الدعوة");
  if (user.isActive) fail(token, "الحساب مفعّل مسبقاً، سجّل الدخول مباشرة");
  if (user.role !== invitation.role) fail(token, "نوع الدعوة لا يطابق نوع الحساب");

  const passwordHash = await hashPassword(password);

  try {
    await db.$transaction(async (tx) => {
      // الحجز الذرّي للدعوة يمنع استخدام الرابط مرتين في نفس اللحظة.
      const claimed = await tx.invitation.updateMany({
        where: { id: invitation.id, acceptedAt: null },
        data: { acceptedAt: new Date() },
      });
      if (claimed.count === 0) throw new ActivationError("استُعمل هذا الرابط مسبقاً");

      await tx.user.update({ where: { id: user.id }, data: { passwordHash, isActive: true } });
      await tx.auditLog.create({
        data: {
          centerId: user.centerId,
          actorId: user.id,
          action: "activate",
          entity: "User",
          entityId: user.id,
          meta: { invitationId: invitation.id },
        },
      });
    });
  } catch (err) {
    if (err instanceof ActivationError) fail(token, err.message);
    throw err;
  }

  redirect("/login?activated=1");
}
