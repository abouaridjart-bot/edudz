import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { canList, allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";
import { sessionStatus } from "@/lib/labels";

export default async function AttendancePage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "attendance")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const sessions = await db.session.findMany({
    where: {
      centerId: requireCenterId(actor),
      ...(branchIds ? { group: { branchId: { in: branchIds } } } : {}),
    },
    include: {
      group: true,
      room: true,
      teacher: { include: { user: true } },
      attendance: { select: { status: true } },
    },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="الحضور"
        description="سجل الحضور لكل حصة: عدد الحاضرين والغائبين. إدخال الحضور التفصيلي قيد الإنشاء."
      />

      {sessions.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="لا توجد حصص"
          description="ستظهر سجلات الحضور بعد إجراء الحصص."
        />
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const present = s.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
            const absent = s.attendance.filter((a) => a.status === "ABSENT").length;
            return (
              <li key={s.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {s.group.name} · <span className="ltr-isolate">{formatDate(s.date)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="ltr-isolate">
                      {s.startTime}–{s.endTime}
                    </span>{" "}
                    · {s.room.name} · {s.teacher.user.fullName}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {s.attendance.length > 0 ? (
                    <>
                      <ToneBadge tone="success">حاضر {present}</ToneBadge>
                      <ToneBadge tone="danger">غائب {absent}</ToneBadge>
                    </>
                  ) : (
                    <span className="text-xs text-muted-foreground">لم يُسجَّل بعد</span>
                  )}
                  <StatusBadge status={sessionStatus(s.status)} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
