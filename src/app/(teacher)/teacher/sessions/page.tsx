import { redirect } from "next/navigation";
import { CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate, WEEKDAYS_AR, algiersParts } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { sessionStatus } from "@/lib/labels";

export default async function TeacherSessionsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  const teacher = await db.teacher.findUnique({ where: { userId: actor.id } });
  if (!teacher) redirect("/");

  const sessions = await db.session.findMany({
    where: { teacherId: teacher.id },
    include: { group: true, room: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 40,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="حصصي" description="كل الحصص المسندة إليك مرتبة حسب التاريخ." />

      {sessions.length === 0 ? (
        <EmptyState icon={CalendarDays} title="لا توجد حصص" description="ستظهر الحصص بعد توليد جدول الأفواج." />
      ) : (
        <ul className="space-y-2">
          {sessions.map((s) => (
            <li key={s.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {s.group.name} ·{" "}
                  <span className="ltr-isolate">
                    {s.startTime}–{s.endTime}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  {WEEKDAYS_AR[algiersParts(s.date).weekday]} {formatDate(s.date)} · {s.room.name}
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
