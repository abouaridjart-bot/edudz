import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { canList, allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function TeachersPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "teacher")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const teachers = await db.teacher.findMany({
    where: {
      centerId: requireCenterId(actor),
      ...(branchIds ? { groups: { some: { branchId: { in: branchIds } } } } : {}),
    },
    include: { user: true, groups: { select: { id: true } } },
    orderBy: { id: "asc" },
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الأساتذة" description="فريق التدريس وعدد الأفواج المسندة لكل أستاذ." />

      {teachers.length === 0 ? (
        <EmptyState icon={GraduationCap} title="لا يوجد أساتذة" description="أضف الأساتذة ثم أسنِدهم إلى الأفواج." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {teachers.map((t) => (
            <li key={t.id} className="panel flex items-center gap-3 p-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <GraduationCap className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold">{t.user.fullName}</p>
                <p className="text-sm text-muted-foreground">{t.user.phone ?? "بدون هاتف"}</p>
              </div>
              <ToneBadge tone={t.groups.length > 0 ? "info" : "neutral"}>{t.groups.length} فوج</ToneBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
