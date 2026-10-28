import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, CalendarDays, ClipboardList, UsersRound } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate, todayInAlgiers, WEEKDAYS_AR, algiersParts } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { sessionStatus } from "@/lib/labels";

export default async function StudentDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "STUDENT") redirect("/");

  const student = await db.student.findUnique({
    where: { userId: actor.id },
    include: {
      user: true,
      branch: true,
      level: true,
      enrollments: {
        where: { status: "ACTIVE" },
        include: { group: { include: { subject: true, teacher: { include: { user: true } } } } },
      },
    },
  });
  if (!student) redirect("/");

  const groupIds = student.enrollments.map((e) => e.groupId);
  const [sessions, attendance] = await Promise.all([
    db.session.findMany({
      where: { groupId: { in: groupIds }, date: { gte: todayInAlgiers() }, status: { in: ["PLANNED", "MAKEUP"] } },
      include: { group: true, room: true },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
      take: 5,
    }),
    db.attendance.groupBy({ by: ["status"], where: { studentId: student.id }, _count: { _all: true } }),
  ]);

  const totalMarks = attendance.reduce((n, a) => n + a._count._all, 0);
  const presentMarks = attendance
    .filter((a) => a.status === "PRESENT" || a.status === "LATE")
    .reduce((n, a) => n + a._count._all, 0);
  const rate = totalMarks > 0 ? Math.round((presentMarks / totalMarks) * 100) : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`مرحباً ${student.user?.fullName ?? ""}`.trim()}
        description={`${student.branch?.name ?? "—"} · ${student.level?.nameAr ?? "—"}`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="أفواجي" value={String(student.enrollments.length)} hint="اشتراك نشط" icon={UsersRound} />
        <StatCard
          label="نسبة الحضور"
          value={rate === null ? "—" : `${rate}%`}
          hint={totalMarks > 0 ? `${presentMarks} من ${totalMarks} حصة` : "لا توجد سجلات بعد"}
        />
        <StatCard label="حصص قادمة" value={String(sessions.length)} hint="خلال الأيام القادمة" icon={CalendarDays} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel overflow-hidden">
          <div className="border-b p-4">
            <h2 className="font-bold">أفواجي</h2>
          </div>
          {student.enrollments.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={UsersRound} title="لا توجد أفواج" description="تواصل مع إدارة المركز لتسجيلك في فوج." />
            </div>
          ) : (
            <ul className="divide-y">
              {student.enrollments.map((e) => (
                <li key={e.id} className="p-4">
                  <p className="font-semibold">{e.group.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {e.group.subject.nameAr} · {e.group.teacher.user.fullName}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="font-bold">الحصص القادمة</h2>
            <Link href="/student/quizzes" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              الاختبارات <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </div>
          {sessions.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={CalendarDays} title="لا توجد حصص قادمة" />
            </div>
          ) : (
            <ul className="divide-y">
              {sessions.map((s) => (
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
                  <StatusBadge status={sessionStatus(s.status)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Link href="/student/quizzes" className="panel flex items-center gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40">
        <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="size-5" aria-hidden />
        </span>
        <span className="font-semibold">الاختبارات الذاتية</span>
        <ArrowLeft className="ms-auto size-4 text-muted-foreground" aria-hidden />
      </Link>
    </div>
  );
}
