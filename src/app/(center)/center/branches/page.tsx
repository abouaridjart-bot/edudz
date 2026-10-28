import { redirect } from "next/navigation";
import { Building2, DoorOpen } from "lucide-react";
import { branchWhere, canList } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";
import { weekdayName } from "@/lib/dates";

export default async function BranchesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "branch")) redirect("/");

  const branches = await db.branch.findMany({
    where: branchWhere(actor),
    include: { rooms: true, _count: { select: { students: true, groups: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الفروع والقاعات" description="هيكل المركز: الفروع، القاعات، وأيام العمل." />

      {branches.length === 0 ? (
        <EmptyState icon={Building2} title="لا توجد فروع" description="أنشئ فرعاً أولاً لتتمكن من إضافة القاعات والطلاب." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {branches.map((b) => (
            <li key={b.id} className="panel space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">{b.name}</p>
                  {b.address ? <p className="text-sm text-muted-foreground">{b.address}</p> : null}
                </div>
                <ToneBadge tone="info">{b.rooms.length} قاعة</ToneBadge>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <ToneBadge tone="neutral">{b._count.students} طالب</ToneBadge>
                <ToneBadge tone="neutral">{b._count.groups} فوج</ToneBadge>
              </div>

              {b.rooms.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {b.rooms.map((r) => (
                    <li
                      key={r.id}
                      className="inline-flex items-center gap-1 rounded-md border bg-muted/40 px-2 py-1 text-xs text-muted-foreground"
                    >
                      <DoorOpen className="size-3.5" aria-hidden />
                      {r.name}
                    </li>
                  ))}
                </ul>
              ) : null}

              {b.weekDays.length > 0 ? (
                <p className="text-xs text-muted-foreground">
                  أيام العمل: {b.weekDays.map((d) => weekdayName(d)).join("، ")}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
