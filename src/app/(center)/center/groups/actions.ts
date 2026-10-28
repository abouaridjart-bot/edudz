"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ActionError, withAction } from "@/lib/action";
import { db } from "@/lib/db";
import { todayInAlgiers } from "@/lib/dates";
import { checkEnrollment, type EnrollmentBlockReason } from "@/lib/enrollment";
import { requireCenterId } from "@/lib/permissions";

const schema = z.object({
  groupId: z.string().trim().min(1, "اختر الفوج"),
  studentId: z.string().trim().min(1, "اختر الطالب"),
});

type EnrollInput = z.infer<typeof schema>;

const BLOCK_MESSAGES: Record<EnrollmentBlockReason, string> = {
  invalid: "بيانات الفوج غير صالحة",
  "group-not-active": "لا يمكن التسجيل في فوج موقوف أو مغلق",
  "already-enrolled": "الطالب مسجّل بالفعل في هذا الفوج",
  full: "الفوج ممتلئ، لا توجد مقاعد متاحة",
};

/**
 * تسجيل طالب في فوج: تحقق من الصلاحية والمركز والفرع، ثم فحص التكرار والسعة
 * داخل معاملة Serializable حتى لا يتجاوز تسجيلان متزامنان سعة الفوج.
 */
export async function enrollStudent(formData: FormData): Promise<void> {
  const result = await withAction<unknown, EnrollInput, { enrollmentId: string; studentName: string; groupName: string }>({
    input: { groupId: formData.get("groupId"), studentId: formData.get("studentId") },
    schema,
    resource: "enrollment",
    action: "create",
    getTarget: async (input) => {
      const group = await db.group.findUnique({
        where: { id: input.groupId },
        select: { centerId: true, branchId: true },
      });
      // فرع الفوج يحدد النطاق الذي تُفحص فيه صلاحية مدير الفرع/السكرتير.
      return group ? { centerId: group.centerId, branchId: group.branchId } : {};
    },
    audit: {
      entity: "Enrollment",
      getEntityId: (_input, data) => data.enrollmentId,
      getMeta: (input) => ({ groupId: input.groupId, studentId: input.studentId }),
    },
    execute: async (input, actor) => {
      const centerId = requireCenterId(actor);

      const group = await db.group.findFirst({
        where: { id: input.groupId, centerId },
        select: { id: true, name: true, branchId: true, capacity: true, status: true },
      });
      if (!group) throw new ActionError("الفوج غير موجود");

      const student = await db.student.findFirst({
        where: { id: input.studentId, centerId, deletedAt: null },
        select: { id: true, branchId: true, user: { select: { fullName: true } } },
      });
      if (!student) throw new ActionError("الطالب غير موجود");
      if (student.branchId !== group.branchId) {
        throw new ActionError("الطالب من فرع مختلف عن فرع الفوج");
      }

      const studentName = student.user?.fullName ?? "الطالب";

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const enrollment = await db.$transaction(
            async (tx) => {
              const [activeCount, existing] = await Promise.all([
                tx.enrollment.count({ where: { groupId: group.id, status: "ACTIVE" } }),
                tx.enrollment.findFirst({
                  where: { groupId: group.id, studentId: student.id, status: "ACTIVE" },
                  select: { id: true },
                }),
              ]);

              const check = checkEnrollment({
                capacity: group.capacity,
                activeCount,
                alreadyActive: Boolean(existing),
                groupStatus: group.status,
              });
              if (!check.ok) throw new ActionError(BLOCK_MESSAGES[check.reason]);

              return tx.enrollment.create({
                data: {
                  centerId,
                  studentId: student.id,
                  groupId: group.id,
                  status: "ACTIVE",
                  startDate: todayInAlgiers(),
                },
                select: { id: true },
              });
            },
            { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
          );

          return { enrollmentId: enrollment.id, studentName, groupName: group.name };
        } catch (err) {
          const retryable =
            err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2034" && attempt < 2;
          if (!retryable) throw err;
        }
      }

      throw new ActionError("تعذّر إتمام التسجيل بسبب تزاحم، أعد المحاولة");
    },
  });

  if (!result.ok) {
    redirect(`/center/groups?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/center/groups");
  const message = `تم تسجيل ${result.data.studentName} في ${result.data.groupName}`;
  redirect(`/center/groups?ok=${encodeURIComponent(message)}`);
}
