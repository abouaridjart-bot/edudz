"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { ActionError, withAction } from "@/lib/action";
import { db } from "@/lib/db";
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

      try {
        const student = await db.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: {
              centerId,
              role: "STUDENT",
              fullName: input.fullName,
              phone: input.phone ?? null,
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
          throw new ActionError("رقم الهاتف مستعمل لحساب آخر");
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
