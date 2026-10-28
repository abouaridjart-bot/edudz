import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ReceiptText, Users } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDinars } from "@/lib/money";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function ParentDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "PARENT") redirect("/");

  const parent = await db.parent.findUnique({
    where: { userId: actor.id },
    include: {
      children: {
        include: {
          student: {
            include: {
              user: true,
              branch: true,
              level: true,
              enrollments: {
                where: { status: "ACTIVE" },
                include: { group: true, invoices: { where: { status: { in: ["ISSUED", "PARTIAL"] } } } },
              },
            },
          },
        },
      },
    },
  });

  const children = parent?.children ?? [];
  const sources = children.flatMap((c) => c.student.enrollments.flatMap((e) => e.invoices));
  const outstanding = sources.reduce((sum, inv) => sum + Math.max(0, inv.total - inv.paid), 0);

  return (
    <div className="space-y-6">
      <PageHeader title="بوابة الولي" description="متابعة أبنائك، أفواجهم، ومستحقاتهم." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="أبنائي" value={String(children.length)} hint="طالب مسجّل" icon={Users} />
        <StatCard label="فواتير غير مسددة" value={String(sources.length)} hint="تحتاج متابعة" icon={ReceiptText} />
        <StatCard
          label="إجمالي المستحقات"
          value={formatDinars(outstanding)}
          className={outstanding > 0 ? "border-amber-500/40" : undefined}
        />
      </div>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <h2 className="font-bold">أبنائي</h2>
          <Link href="/parent/children" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            التفاصيل <ArrowLeft className="size-4" aria-hidden />
          </Link>
        </div>
        {children.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Users} title="لا يوجد أبناء مرتبطون" description="تواصل مع إدارة المركز لربط حسابك بأبنائك." />
          </div>
        ) : (
          <ul className="divide-y">
            {children.map(({ student }) => (
              <li key={student.id} className="flex flex-wrap items-center justify-between gap-2 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{student.user?.fullName ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">
                    {student.branch?.name ?? "—"} · {student.level?.nameAr ?? "—"} · {student.enrollments.length} فوج
                  </p>
                </div>
                <ToneBadge tone="info">{student.enrollments.length} اشتراك</ToneBadge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
