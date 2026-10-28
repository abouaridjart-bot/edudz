import { redirect } from "next/navigation";
import { Layers } from "lucide-react";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function UnitsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "lesson")) redirect("/");

  const units = await db.unit.findMany({
    include: { levelSubject: { include: { level: true, subject: true } }, lessons: true },
    orderBy: [{ levelSubjectId: "asc" }, { order: "asc" }],
    take: 100,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الوحدات" description="وحدات المنهاج مرتبة حسب المستوى والمادة." />

      {units.length === 0 ? (
        <EmptyState icon={Layers} title="لا توجد وحدات" description="ستظهر الوحدات بعد إدخال محتوى المنهاج." />
      ) : (
        <ul className="space-y-2">
          {units.map((u) => (
            <li key={u.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  <span className="text-muted-foreground">{u.order}.</span> {u.title}
                </p>
                <p className="text-sm text-muted-foreground">
                  {u.levelSubject.level.nameAr} · {u.levelSubject.subject.nameAr}
                </p>
              </div>
              <ToneBadge tone={u.lessons.length > 0 ? "info" : "neutral"}>{u.lessons.length} درس</ToneBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
