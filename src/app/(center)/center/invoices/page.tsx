import { redirect } from "next/navigation";
import { ReceiptText } from "lucide-react";
import { db } from "@/lib/db";
import { formatDinars } from "@/lib/money";
import { algiersParts, formatPeriod } from "@/lib/dates";
import { allowedBranchIds, branchWhere, canList, requireCenterId } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { invoiceStatus } from "@/lib/labels";
import { generateInvoices } from "./actions";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "invoice")) redirect("/");

  const canGenerate = canList(actor, "create", "invoice");

  const branchIds = allowedBranchIds(actor);
  const [invoices, branches] = await Promise.all([
    db.invoice.findMany({
      where: {
        centerId: requireCenterId(actor),
        ...(branchIds ? { enrollment: { student: { branchId: { in: branchIds } } } } : {}),
      },
      include: { enrollment: { include: { student: { include: { user: true } }, group: true } } },
      orderBy: [{ createdAt: "desc" }],
      take: 50,
    }),
    canGenerate
      ? db.branch.findMany({
          where: branchWhere(actor),
          select: { id: true, name: true },
          orderBy: { name: "asc" },
        })
      : Promise.resolve([]),
  ]);

  const total = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const paid = invoices.reduce((sum, inv) => sum + inv.paid, 0);
  const outstanding = total - paid;
  const unpaid = invoices.filter((inv) => inv.status === "ISSUED" || inv.status === "PARTIAL").length;
  const now = algiersParts(new Date());
  const currentPeriod = `${now.year}-${String(now.month).padStart(2, "0")}`;

  return (
    <div className="space-y-6">
      <PageHeader
        title="الفواتير"
        description="فواتير الاشتراكات الشهرية للطلاب مع حالة السداد والمتبقي."
      />

      {ok ? <Alert variant="success">{ok}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      {canGenerate && branches.length > 0 ? (
        <section className="panel panel-body space-y-3">
          <div>
            <h2 className="font-bold">توليد فواتير الشهر</h2>
            <p className="text-sm text-muted-foreground">
              تُنشأ فاتورة واحدة لكل تسجيل نشط في الفرع المختار. لا تتكرر فاتورة التسجيل نفسه للشهر نفسه.
            </p>
          </div>
          <form action={generateInvoices} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="space-y-1">
              <label htmlFor="period" className="field-label">
                الشهر
              </label>
              <input
                id="period"
                type="month"
                name="period"
                defaultValue={currentPeriod}
                min="2020-01"
                max="2100-12"
                required
                className="field-input"
              />
            </div>
            <div className="min-w-48 space-y-1">
              <label htmlFor="branchId" className="field-label">
                الفرع
              </label>
              <select id="branchId" name="branchId" required defaultValue={branches[0]?.id ?? ""} className="field-input">
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
              توليد الفواتير
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            تُصدَر الفواتير بحالة «صادرة» وتاريخ استحقاق 10 من الشهر المختار. الأشهر السابقة تُقبل أيضاً (مفيدة للتأخر في الفوترة).
          </p>
        </section>
      ) : null}

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
