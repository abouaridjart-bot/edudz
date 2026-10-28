import { redirect } from "next/navigation";
import { ClipboardCheck } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { todayInAlgiers, formatDate, WEEKDAYS_AR, algiersParts } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function TeacherDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  const teacher = await db.teacher.findUnique({
    where: { userId: actor.id },
    include: {
      groups: { where: { status: "ACTIVE" }, include: { enrollments: { where: { status: "ACTIVE" }, select: { id: true } } } },
    },
  });
  if (!teacher) redirect("/");

  const [upcoming, todayCount] = await Promise.all([
    db.session.findMany({
      where: { teacherId: teacher.id, date: { gte: todayInAlgiers() }, status: { in: ["PLANNED", "MAKEUP"] } },
      include: { group: true, room: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 3,
    }),
    db.session.count({ where: { teacherId: teacher.id, date: todayInAlgiers() } }),
  ]);

  const students = teacher.groups.reduce((sum, g) => sum + g.enrollments.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader title="لوحة الأستاذ" description="ملخص أفواجك وحصصك القادمة." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="أفواجي" value={String(teacher.groups.length)} hint="فوج نشط" />
        <StatCard label="طلابي" value={String(students)} hint="طالب مسجّل" />
        <StatCard label="حصص اليوم" value={String(todayCount)} hint="حصة مبرمجة" />
        <StatCard label="حصص قادمة" value={String(upcoming.length)} hint="أقرب الحصص" />
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-bold">الحصص القادمة</h2>
        </div>
        {upcoming.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={ClipboardCheck} title="لا توجد حصص قادمة" />
          </div>
        ) : (
          <ul className="divide-y">
            {upcoming.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div>
                  <p className="font-semibold">{s.group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {WEEKDAYS_AR[algiersParts(s.date).weekday]} {formatDate(s.date)} ·{" "}
                    <span className="ltr-isolate">
                      {s.startTime}–{s.endTime}
                    </span>{" "}
                    · {s.room.name}
                  </p>
                </div>
                <ToneBadge tone="info">{s.status === "MAKEUP" ? "استدراك" : "مبرمجة"}</ToneBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
