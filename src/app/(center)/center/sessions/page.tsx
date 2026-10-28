import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { canList, allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate, WEEKDAYS_AR, algiersParts } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { sessionStatus } from "@/lib/labels";

export default async function SessionsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "session")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const sessions = await db.session.findMany({
    where: {
      centerId: requireCenterId(actor),
      ...(branchIds ? { group: { branchId: { in: branchIds } } } : {}),
    },
    include: { group: true, room: true, teacher: { include: { user: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الحصص والجداول" description="الحصص القادمة مرتبة حسب التاريخ والتوقيت." />

      {sessions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="لا توجد حصص" description="ستظهر الحصص بعد إنشاء الأفواج وتوليد الجدول." />
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {s.group.name} · <span className="ltr-isolate">{s.startTime}–{s.endTime}</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {WEEKDAYS_AR[algiersParts(s.date).weekday]} {formatDate(s.date)} · {s.room.name} · {s.teacher.user.fullName}
                </p>
              </div>
              <StatusBadge status={sessionStatus(s.status)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
