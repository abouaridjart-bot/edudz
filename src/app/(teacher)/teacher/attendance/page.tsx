import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";
import { sessionStatus } from "@/lib/labels";

export default async function TeacherAttendancePage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  const teacher = await db.teacher.findUnique({ where: { userId: actor.id } });
  if (!teacher) redirect("/");

  const sessions = await db.session.findMany({
    where: { teacherId: teacher.id },
    include: { group: true, attendance: { select: { status: true } } },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الحضور" description="ملخص الحضور في حصصك. إدخال الحضور التفصيلي قيد الإنشاء." />

      {sessions.length === 0 ? (
        <EmptyState icon={ClipboardCheck} title="لا توجد حصص" description="ستظهر سجلات الحضور بعد إجراء الحصص." />
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => {
            const present = s.attendance.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
            return (
              <li key={s.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">
                    {s.group.name} · <span className="ltr-isolate">{formatDate(s.date)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground ltr-isolate">
                    {s.startTime}–{s.endTime}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {s.attendance.length > 0 ? (
                    <ToneBadge tone="success">حاضر {present}</ToneBadge>
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
