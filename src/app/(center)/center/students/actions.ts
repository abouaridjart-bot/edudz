"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ActionError, withAction } from "@/lib/action";
import { db } from "@/lib/db";
import { createInvitation } from "@/lib/invitations";
import { hashPassword } from "@/lib/password";
import { requireCenterId } from "@/lib/permissions";
import { studentCreateSchema, type StudentCreateInput } from "@/lib/student-input";

/** مركز الفرع يُقرأ من قاعدة البيانات لا من النموذج؛ أي فرع غير موجود = رفض. */
async function getBranchTarget(input: StudentCreateInput) {
  const branch = await db.branch.findUnique({
    where: { id: input.branchId },
    select: { centerId: true },
  });
  if (!branch) return {};
  return { centerId: branch.centerId, branchId: input.branchId };
}

export async function createStudent(formData: FormData): Promise<void> {
  const result = await withAction<unknown, StudentCreateInput, { studentId: string }>({
    input: {
      fullName: formData.get("fullName"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      branchId: formData.get("branchId"),
      levelId: formData.get("levelId"),
      streamId: formData.get("streamId"),
      birthDate: formData.get("birthDate"),
      schoolName: formData.get("schoolName"),
      notes: formData.get("notes"),
    },
    schema: studentCreateSchema,
    resource: "student",
    action: "create",
    getTarget: getBranchTarget,
    audit: {
      entity: "Student",
      getEntityId: (_input, data) => data.studentId,
      getMeta: (input) => ({ branchId: input.branchId, levelId: input.levelId, hasPhone: !!input.phone }),
    },
    execute: async (input, actor) => {
      const centerId = requireCenterId(actor);

      const level = await db.level.findUnique({ where: { id: input.levelId }, select: { id: true } });
      if (!level) throw new ActionError("المستوى الدراسي غير موجود");

      if (input.streamId) {
        const stream = await db.stream.findUnique({
          where: { id: input.streamId },
          select: { levelId: true },
        });
        if (!stream || stream.levelId !== input.levelId) {
          throw new ActionError("الشعبة لا تنتمي إلى المستوى المختار");
        }
      }

      // كلمة مرور عشوائية غير معروفة + حساب غير مفعّل: يبقى الطالب بلا دخول حتى تُفعَّل الدعوة/كلمة المرور.
      const passwordHash = await hashPassword(randomBytes(24).toString("hex"));

      if (input.email) {
        const existingEmail = await db.user.findUnique({ where: { email: input.email }, select: { id: true } });
        if (existingEmail) throw new ActionError("البريد الإلكتروني مستعمل لحساب آخر");
      }

      try {
        const student = await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              centerId,
              role: "STUDENT",
              fullName: input.fullName,
              phone: input.phone ?? null,
              email: input.email ?? null,
              passwordHash,
              isActive: false,
            },
            select: { id: true },
          });
          return tx.student.create({
            data: {
              centerId,
              userId: user.id,
              branchId: input.branchId,
              levelId: input.levelId,
              streamId: input.streamId ?? null,
              birthDate: input.birthDate ?? null,
              schoolName: input.schoolName ?? null,
              notes: input.notes ?? null,
            },
            select: { id: true },
          });
        });
        return { studentId: student.id };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          throw new ActionError("رقم الهاتف أو البريد الإلكتروني مستعمل لحساب آخر");
        }
        throw err;
      }
    },
  });

  if (!result.ok) {
    redirect(`/center/students?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/center/students");
  redirect(`/center/students?ok=${encodeURIComponent("تمت إضافة الطالب بنجاح")}`);
}

const inviteSchema = z.object({ studentId: z.string().trim().min(1, "اختر الطالب") });

type InviteInput = z.infer<typeof inviteSchema>;

/**
 * إنشاء (أو إعادة استخدام) دعوة تفعيل حساب طالب. لا يُرسَل بريد فعلي بعد؛
 * يُعرض رابط التفعيل في صفحة الدعوات ليرسله المسؤول للطالب.
 */
export async function inviteStudentAccount(formData: FormData): Promise<void> {
  const result = await withAction<unknown, InviteInput, { token: string; studentName: string; reused: boolean }>({
    input: { studentId: formData.get("studentId") },
    schema: inviteSchema,
    resource: "user",
    action: "create",
    getTarget: async (input) => {
      const student = await db.student.findUnique({
        where: { id: input.studentId },
        select: { centerId: true, branchId: true },
      });
      return student ? { centerId: student.centerId, branchId: student.branchId } : {};
    },
    audit: {
      entity: "Invitation",
      getMeta: (input, data) => ({ studentId: input.studentId, reused: data.reused }),
    },
    execute: async (input, actor) => {
      const centerId = requireCenterId(actor);

      const student = await db.student.findFirst({
        where: { id: input.studentId, centerId, deletedAt: null },
        select: { id: true, userId: true, user: { select: { email: true, fullName: true, isActive: true } } },
      });
      if (!student || !student.user) throw new ActionError("الطالب غير موجود");
      if (student.user.isActive) throw new ActionError("حساب الطالب مفعّل بالفعل");
      if (!student.user.email) {
        throw new ActionError("أضف بريداً إلكترونياً للطالب أولاً (لا يمكن تعديله بعد الإنشاء حالياً)");
      }

      const pending = await db.invitation.findFirst({
        where: {
          centerId,
          email: student.user.email,
          role: "STUDENT",
          acceptedAt: null,
          expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: { id: true, token: true },
      });
      if (pending) {
        return { token: pending.token, studentName: student.user.fullName, reused: true };
      }

      const invitation = await createInvitation({
        centerId,
        role: "STUDENT",
        email: student.user.email,
        invitedById: actor.id,
      });
      return { token: invitation.token, studentName: student.user.fullName, reused: false };
    },
  });

  if (!result.ok) {
    redirect(`/center/students?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/center/students");
  revalidatePath("/center/invitations");
  const message = result.data.reused
    ? `دعوة ${result.data.studentName} موجودة وسارية؛ الرابط في صفحة الدعوات`
    : `أُنشئ رابط تفعيل ${result.data.studentName}؛ انسخه من صفحة الدعوات`;
  redirect(`/center/invitations?ok=${encodeURIComponent(message)}`);
}
