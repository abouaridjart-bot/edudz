import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { db } from "@/lib/db";
import { formatDinars } from "@/lib/money";
import { formatPeriod } from "@/lib/dates";
import { allowedBranchIds, canList, requireCenterId } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { invoiceStatus } from "@/lib/labels";

export default async function InvoicesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "invoice")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const invoices = await db.invoice.findMany({
    where: {
      centerId: requireCenterId(actor),
      ...(branchIds ? { enrollment: { student: { branchId: { in: branchIds } } } } : {}),
    },
    include: { enrollment: { include: { student: { include: { user: true } }, group: true } } },
    orderBy: [{ createdAt: "desc" }],
    take: 50,
  });

  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paid = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const outstanding = total - paid;
  const unpaid = invoices.filter((inv) => inv.status === "ISSUED" || inv.status === "PARTIAL").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="الفواتير"
        description="فواتير الاشتراكات الشهرية للطلاب مع حالة السداد والمتبقي."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="عدد الفواتير" value={String(invoices.length)} hint="آخر 50 فاتورة" icon={ReceiptText} />
        <StatCard label="الإجمالي" value={formatDinars(total)} hint="قيمة الفواتير المعروضة" />
        <StatCard label="المحصّل" value={formatDinars(paid)} hint="مدفوع فعلياً" />
        <StatCard
          label="المتبقي"
          value={formatDinars(outstanding)}
          hint={`${unpaid} فاتورة غير مسددة`}
          className={outstanding > 0 ? "border-amber-500/40" : undefined}
        />
      </div>

      <section className="panel overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-bold">آخر الفواتير</h2>
        </div>
        {invoices.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={ReceiptText} title="لا توجد فواتير" description="تُنشأ الفواتير من اشتراكات الطلاب في الأفواج." />
          </div>
        ) : (
          <ul className="divide-y">
            {invoices.map((inv) => {
              const remaining = inv.total - inv.paid;
              return (
                <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{inv.enrollment.student.user?.fullName ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {inv.enrollment.group.name} · <span className="ltr-isolate">{formatPeriod(inv.period)}</span>
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-end">
                      <p className="font-semibold tabular-nums">{formatDinars(inv.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        مدفوع {formatDinars(inv.paid)}
                        {remaining > 0 ? ` · متبقٍ ${formatDinars(remaining)}` : ""}
                      </p>
                    </div>
                    <StatusBadge status={invoiceStatus(inv.status)} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
