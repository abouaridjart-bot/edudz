import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { canList, scopeWhere } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";
import { groupStatus } from "@/lib/labels";
import { enrollStudent } from "./actions";

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "group")) redirect("/");

  const canEnroll = canList(actor, "create", "enrollment");

  const [groups, students] = await Promise.all([
    db.group.findMany({
      where: scopeWhere(actor),
      include: {
        branch: true,
        level: true,
        subject: true,
        teacher: { include: { user: true } },
        enrollments: { where: { status: "ACTIVE" }, select: { id: true, studentId: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    canEnroll
      ? db.student.findMany({
          where: { ...scopeWhere(actor), deletedAt: null },
          select: { id: true, branchId: true, user: { select: { fullName: true } } },
          orderBy: { createdAt: "asc" },
          take: 500,
        })
      : Promise.resolve([]),
  ]);

  const nameById = new Map(students.map((s) => [s.id, s.user?.fullName ?? "طالب بدون اسم"]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="الأفواج"
        description="الأفواج الدراسية، أساتذتها، ونسبة امتلاء كل فوج مع تسجيل الطلاب."
      />

      {ok ? <Alert variant="success">{ok}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      {groups.length === 0 ? (
        <EmptyState icon={UsersRound} title="لا توجد أفواج" description="أنشئ فوجاً أولاً ثم أضف إليه الطلاب." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const enrolled = g.enrollments.length;
            const fill = g.capacity > 0 ? Math.min(100, Math.round((enrolled / g.capacity) * 100)) : 0;
            const activeIds = new Set(g.enrollments.map((e) => e.studentId));
            const eligible = students
              .filter((s) => s.branchId === g.branchId && !activeIds.has(s.id))
              .map((s) => ({ id: s.id, name: s.user?.fullName ?? "طالب بدون اسم" }))
              .sort((a, b) => a.name.localeCompare(b.name, "ar"));
            const hasSeat = g.capacity > 0 && enrolled < g.capacity;
            const canAddHere = canEnroll && g.status === "ACTIVE" && hasSeat && eligible.length > 0;

            return (
              <li key={g.id} className="panel flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-bold">{g.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {g.branch.name} · {g.level.code} · {g.subject.nameAr}
                    </p>
                  </div>
                  <StatusBadge status={groupStatus(g.status)} />
                </div>

                <p className="text-sm text-muted-foreground">{g.teacher.user.fullName}</p>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">الامتلاء</span>
                    <span className="font-semibold tabular-nums">
                      {enrolled} / {g.capacity}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={fill >= 90 ? "h-full rounded-full bg-amber-500" : "h-full rounded-full bg-primary"}
                      style={{ width: `${fill}%` }}
                    />
                  </div>
                </div>

                {fill >= 100 ? <ToneBadge tone="warning">الفوج ممتلئ</ToneBadge> : null}

                {enrolled > 0 ? (
                  <details className="text-sm">
                    <summary className="cursor-pointer font-medium text-muted-foreground">
                      الطلاب المسجّلون ({enrolled})
                    </summary>
                    <ul className="mt-2 space-y-1 ps-4 text-muted-foreground">
                      {g.enrollments.map((e) => (
                        <li key={e.id} className="list-disc">
                          {nameById.get(e.studentId) ?? "—"}
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}

                {canAddHere ? (
                  <details className="rounded-lg border bg-muted/30 p-3">
                    <summary className="cursor-pointer text-sm font-semibold">تسجيل طالب في الفوج</summary>
                    <form action={enrollStudent} className="mt-3 flex flex-col gap-2 sm:flex-row">
                      <input type="hidden" name="groupId" value={g.id} />
                      <label htmlFor={`student-${g.id}`} className="sr-only">
                        الطالب
                      </label>
                      <select
                        id={`student-${g.id}`}
                        name="studentId"
                        required
                        defaultValue=""
                        className="field-input flex-1"
                      >
                        <option value="" disabled>
                          اختر طالباً…
                        </option>
                        {eligible.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                      <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        تسجيل
                      </button>
                    </form>
                  </details>
                ) : canEnroll && g.status === "ACTIVE" && hasSeat && eligible.length === 0 ? (
                  <p className="text-xs text-muted-foreground">كل طلاب الفرع مسجّلون في هذا الفوج.</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
