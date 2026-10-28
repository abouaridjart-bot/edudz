import { redirect } from "next/navigation";
import { UsersRound } from "lucide-react";
import { canList, scopeWhere } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";
import { groupStatus } from "@/lib/labels";

export default async function GroupsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "group")) redirect("/");

  const groups = await db.group.findMany({
    where: scopeWhere(actor),
    include: {
      branch: true,
      level: true,
      subject: true,
      teacher: { include: { user: true } },
      enrollments: { where: { status: "ACTIVE" }, select: { id: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الأفواج" description="الأفواج الدراسية، أساتذتها، ونسبة امتلاء كل فوج." />

      {groups.length === 0 ? (
        <EmptyState icon={UsersRound} title="لا توجد أفواج" description="أنشئ فوجاً أولاً ثم أضف إليه الطلاب." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => {
            const enrolled = g.enrollments.length;
            const fill = g.capacity > 0 ? Math.min(100, Math.round((enrolled / g.capacity) * 100)) : 0;
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
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
