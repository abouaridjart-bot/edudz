import { redirect } from "next/navigation";
import { ClipboardCheck, Users, Check } from "lucide-react";
import { can, canList, allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";
import { sessionStatus, attendanceStatus } from "@/lib/labels";
import { markAttendance } from "@/lib/attendance-action";

export default async function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "session")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const session = await db.session.findUnique({
    where: { id: sessionId },
    include: {
      group: true,
      room: true,
      teacher: { include: { user: true } },
      attendance: { select: { studentId: true, status: true } },
    },
  });
  if (!session) redirect("/center/sessions?error=الحصة غير موجودة");

  // تحقق صلاحية الوصول حسب النطاق
  const target = { centerId: session.centerId, branchId: session.group.branchId, ownerId: session.teacherId };
  if (!can(actor, "read", "session", target)) redirect("/");

  // احصل على طلاب الفوج النشطين في تاريخ الجلسة
  const enrollments = await db.enrollment.findMany({
    where: {
      groupId: session.groupId,
      status: "ACTIVE",
      startDate: { lte: session.date },
      OR: [{ endDate: null }, { endDate: { gte: session.date } }],
    },
    include: { student: { include: { user: true } } },
  });

  const roster = enrollments.map((e) => ({
    studentId: e.student.id,
    name: e.student.user?.fullName ?? "—",
    email: e.student.user?.email,
    status: session.attendance.find((a) => a.studentId === e.student.id)?.status,
  }));

  const canMark = can(actor, "create", "attendance", target) && session.status === "DONE";

  return (
    <div className="space-y-6">
      <PageHeader
        title="تفاصيل الحصة"
        description={`جلسة ${session.group.name} · ${formatDate(session.date)} · ${session.startTime}–${session.endTime}`}
      />

      <div className="panel p-4">
        <p className="text-sm text-muted-foreground mb-2">
          المعلم: {session.teacher.user.fullName} – القاعة: {session.room.name}
        </p>
        <StatusBadge status={sessionStatus(session.status)} />
      </div>

      {roster.length === 0 ? (
        <EmptyState icon={Users} title="لا طلاب مسجلون" description="لا يوجد طلاب مسجلون في هذا الفوج لتسجيل حضورهم." />
      ) : (
        <form action={markAttendance} className="space-y-4">
          <input type="hidden" name="sessionId" value={session.id} />
          <ul className="space-y-2">
            {roster.map((r) => (
              <li key={r.studentId} className="panel flex items-center justify-between p-3">
                <div className="min-w-0">
                  <p className="font-medium">{r.name}</p>
                  {r.email ? <p className="text-xs text-muted-foreground" dir="ltr">{r.email}</p> : null}
                </div>
                <div className="flex gap-2 items-center">
                  {canMark ? (
                    <>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={"status_" + r.studentId}
                          value="PRESENT"
                          defaultChecked={r.status === "PRESENT"}
                          className="hidden peer"
                        />
                        <span className="px-2 py-1 border rounded bg-white peer-checked:bg-primary-600 peer-checked:text-white">
                          {attendanceStatus("PRESENT").label}
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={"status_" + r.studentId}
                          value="ABSENT"
                          defaultChecked={r.status === "ABSENT"}
                          className="hidden peer"
                        />
                        <span className="px-2 py-1 border rounded bg-white peer-checked:bg-primary-600 peer-checked:text-white">
                          {attendanceStatus("ABSENT").label}
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={"status_" + r.studentId}
                          value="LATE"
                          defaultChecked={r.status === "LATE"}
                          className="hidden peer"
                        />
                        <span className="px-2 py-1 border rounded bg-white peer-checked:bg-primary-600 peer-checked:text-white">
                          {attendanceStatus("LATE").label}
                        </span>
                      </label>
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name={"status_" + r.studentId}
                          value="EXCUSED"
                          defaultChecked={r.status === "EXCUSED"}
                          className="hidden peer"
                        />
                        <span className="px-2 py-1 border rounded bg-white peer-checked:bg-primary-600 peer-checked:text-white">
                          {attendanceStatus("EXCUSED").label}
                        </span>
                      </label>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {r.status ? attendanceStatus(r.status).label : "لم يُسجَّل"}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          {canMark ? (
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-white"
            >
              <Check className="size-4" aria-hidden />
              حفظ الحضور
            </button>
          ) : null}
        </form>
      )}
    </div>
  );
}
