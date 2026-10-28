"use server";

import { z } from "zod";
import { getActor } from "@/lib/session";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  parentId: z.string().min(1),
  studentId: z.string().min(1),
});

export async function linkParentStudent(formData: FormData) {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "غير مصرح" };

  const parsed = schema.safeParse({
    parentId: formData.get("parentId"),
    studentId: formData.get("studentId"),
  });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const { parentId, studentId } = parsed.data;

  const student = await db.student.findUnique({
    where: { id: studentId },
    select: { id: true, centerId: true },
  });
  if (!student) return { ok: false, error: "غير موجود" };

  const target = { centerId: student.centerId };
  if (!can(actor, "update", "parent", target) && !can(actor, "create", "parent", target)) {
    return { ok: false, error: "غير مصرح" };
  }

  await db.parentStudent.create({
    data: {
      parentId,
      studentId,
    },
  });

  await logAudit(actor, "link", "parent_student", studentId, { parentId });

  return { ok: true };
}
