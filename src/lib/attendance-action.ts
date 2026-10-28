"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { checkAttendance, type AttendanceBlockReason } from "@/lib/attendance";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActor } from "@/lib/session";
import { ActionError } from "@/lib/action";
import { requireCenterId, can } from "@/lib/permissions";

const schema = z.object({
  sessionId: z.string().trim().min(1, "اختر الحصة"),
  studentId: z.string().trim().min(1, "اختر الطالب"),
  status: z.enum(["PRESENT", "ABSENT", "LATE", "EXCUSED"], { required_error: "اختر حالة الحضور" }),
});

const BLOCK_MESSAGES: Record<AttendanceBlockReason, string> = {
  invalid: "بيانات الحصة غير صالحة",
  "session-not-done": "لا يمكن تسجيل الحضور إلا بعد إنجاز الحصة",
  "already-marked": "تم تسجيل حضور الطالب مسبقاً في هذه الحصة",
};

export async function markAttendance(formData: FormData): Promise<void> {
  const actor = await getActor();
  if (!actor) throw new ActionError("غير مصرح");
  const centerId = requireCenterId(actor);

  const rawSessionId = String(formData.get("sessionId") ?? "");
  const rawStudentId = String(formData.get("studentId") ?? "");
  const rawStatus = String(formData.get("status") ?? "");

  const parsed = schema.safeParse({
    sessionId: rawSessionId,
    studentId: rawStudentId,
    status: rawStatus,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    throw new ActionError(first && first.length > 0 ? first : "بيانات غير صالحة");
  }

  const { sessionId, studentId, status } = parsed.data;

  // فحص وجود الحصة والطالب وحقوق الوصول
  const session = await db.session.findUnique({
    where: { id: sessionId },
    select: { id: true, groupId: true, status: true, centerId: true, teacherId: true },
  });
  if (!session) throw new ActionError("الحصة غير موجودة");

  // صلاحية: يمكن للمالك (المعلم) أو للموظف بالمركز/الفرع إنشاء حضور
  const target = { centerId: session.centerId, branchId: undefined, ownerId: session.teacherId };
  if (!can(actor, "create", "attendance", target)) throw new ActionError("غير مصرح");

  const student = await db.student.findFirst({
    where: { id: studentId, centerId },
    select: { id: true },
  });
  if (!student) throw new ActionError("الطالب غير موجود");

  // فحص أن الطالب مسجل في الفوع المرتبط بالحصة
  const enrollment = await db.enrollment.findFirst({
    where: {
      studentId: student.id,
      groupId: session.groupId,
      status: "ACTIVE",
    },
    select: { id: true },
  });
  if (!enrollment) throw new ActionError("الطالب غير مسجل في فوج هذه الحصة");

  // فحص حالة الحصة: لا يمكن تسجيل الحضور إلا للحصص المنجزة
  if (session.status !== "DONE") {
    throw new ActionError("لا يمكن تسجيل الحضور إلا بعد إنجاز الحصة");
  }

  // فحص إذا كان الطالب سجل حضوره مسبقاً في هذه الحصة
  const existing = await db.attendance.findFirst({
    where: {
      sessionId: session.id,
      studentId: student.id,
    },
    select: { id: true },
  });
  if (existing) {
    throw new ActionError("تم تسجيل حضور الطالب مسبقاً في هذه الحصة");
  }

  // إنشاء سجل الحضور
  await db.attendance.create({
    data: {
      centerId,
      sessionId: session.id,
      studentId: student.id,
      status,
      markedBy: actor.id,
    },
  });

  // إعادة تحميل صفحة الحضور
  revalidatePath("/center/attendance");
  redirect("/center/attendance?ok=" + encodeURIComponent("تم تسجيل الحضور بنجاح"));
}