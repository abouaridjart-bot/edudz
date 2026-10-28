import { redirect } from "next/navigation";
import { ReceiptText, Wallet } from "lucide-react";
import { db } from "@/lib/db";
import { formatDinars } from "@/lib/money";
import { formatDateTime, formatPeriod } from "@/lib/dates";
import { allowedBranchIds, canList, requireCenterId, scopeWhere } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { invoiceStatus, payMethod } from "@/lib/labels";
import { recordPayment } from "./actions";

const METHODS = [
  { value: "CASH", label: "نقداً" },
  { value: "CCP", label: "CCP" },
  { value: "BARIDIMOB", label: "BaridiMob" },
  { value: "BANK", label: "تحويل بنكي" },
  { value: "OTHER", label: "أخرى" },
] as const;

export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "create", "payment")) redirect("/");

  const centerId = requireCenterId(actor);
  const branchIds = allowedBranchIds(actor);
  const branchScope = branchIds ? { enrollment: { student: { branchId: { in: branchIds } } } } : {};

  const [payments, openInvoices] = await Promise.all([
    db.payment.findMany({
      where: scopeWhere(actor),
      include: { invoice: { include: { enrollment: { include: { student: { include: { user: true } } } } } } },
      orderBy: { paidAt: "desc" },
      take: 20,
    }),
    db.invoice.findMany({
      where: {
        centerId,
        status: { in: ["ISSUED", "PARTIAL"] },
        ...branchScope,
      },
      include: { enrollment: { include: { student: { include: { user: true } }, group: true } } },
      orderBy: { createdAt: "asc" },
      take: 25,
    }),
  ]);

  const remainingTotal = openInvoices.reduce((sum, inv) => sum + Math.max(0, inv.total - inv.paid), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="المدفوعات والإيصالات"
        description="تسجيل دفعات الطلاب على الفواتير المفتوحة مع إيصال مرقّم تلقائياً."
      />

      {ok ? (
        <Alert variant="success">
          تم تسجيل الدفعة بنجاح — رقم الإيصال: <span className="font-semibold ltr-isolate">{ok}</span>
        </Alert>
      ) : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <h2 className="font-bold">فواتير بانتظار الدفع ({openInvoices.length})</h2>
          <p className="text-sm text-muted-foreground">
            إجمالي المتبقي: <span className="font-semibold text-foreground">{formatDinars(remainingTotal)}</span>
          </p>
        </div>
        {openInvoices.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={ReceiptText} title="لا توجد فواتير غير مسددة" description="كل الفواتير المسجلة مدفوعة بالكامل." />
          </div>
        ) : (
          <ul className="divide-y">
            {openInvoices.map((inv) => {
              const remaining = inv.total - inv.paid;
              const studentName = inv.enrollment.student.user?.fullName ?? "—";
              return (
                <li key={inv.id} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{studentName}</p>
                        <StatusBadge status={invoiceStatus(inv.status)} />
                      </div>
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {inv.enrollment.group.name} · <span className="ltr-isolate">{formatPeriod(inv.period)}</span> · الإجمالي{" "}
                        {formatDinars(inv.total)} · المدفوع {formatDinars(inv.paid)} ·{" "}
                        <span className="font-semibold text-foreground">المتبقي {formatDinars(remaining)}</span>
                      </p>
                    </div>
                    <form action={recordPayment} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <input
                        name="amount"
                        inputMode="numeric"
                        defaultValue={String(remaining)}
                        required
                        aria-label="المبلغ بالدينار"
                        className="field-input w-28 py-1.5"
                      />
                      <select name="method" defaultValue="CASH" aria-label="طريقة الدفع" className="field-input w-auto py-1.5">
                        {METHODS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <button className="inline-flex min-h-9 items-center rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                        تسجيل الدفعة
                      </button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="panel overflow-hidden">
        <div className="border-b p-4">
          <h2 className="font-bold">آخر الدفعات</h2>
        </div>
        {payments.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={Wallet} title="لا توجد دفعات بعد" description="ستظهر الإيصالات هنا بعد تسجيل أول دفعة." />
          </div>
        ) : (
          <ul className="divide-y">
            {payments.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold ltr-isolate">إيصال {p.receiptNo}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.invoice.enrollment.student.user?.fullName ?? "—"} · {payMethod(p.method).label} ·{" "}
                    {formatDateTime(p.paidAt)}
                  </p>
                </div>
                <span className="font-bold tabular-nums text-primary">{formatDinars(p.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
