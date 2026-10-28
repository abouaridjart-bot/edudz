import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { allowedBranchIds, canList, requireCenterId, scopeWhere } from "@/lib/permissions";
import { db } from "@/lib/db";
import { formatDinars } from "@/lib/money";
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

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">المدفوعات والإيصالات</h1>

      {ok ? (
        <p role="status" className="rounded border border-green-600/40 bg-green-600/10 p-3 text-sm">
          تم تسجيل الدفعة بنجاح — رقم الإيصال: <span className="font-semibold">{ok}</span>
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">فواتير بانتظار الدفع ({openInvoices.length})</h2>
        {openInvoices.length === 0 ? (
          <p className="rounded border border-dashed p-3 text-sm text-muted-foreground">لا توجد فواتير غير مسددة.</p>
        ) : (
          <ul className="space-y-2">
            {openInvoices.map((inv) => {
              const remaining = inv.total - inv.paid;
              const studentName = inv.enrollment.student.user?.fullName ?? "-";
              return (
                <li key={inv.id} className="border rounded p-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">
                        {studentName} — {inv.period}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {inv.enrollment.group.name} / الإجمالي {formatDinars(inv.total)} / المدفوع {formatDinars(inv.paid)} /
                        المتبقي {formatDinars(remaining)}
                      </div>
                    </div>
                    <form action={recordPayment} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="invoiceId" value={inv.id} />
                      <input
                        name="amount"
                        inputMode="numeric"
                        defaultValue={String(remaining)}
                        required
                        aria-label="المبلغ بالدينار"
                        className="w-28 rounded border px-2 py-1"
                      />
                      <select
                        name="method"
                        defaultValue="CASH"
                        aria-label="طريقة الدفع"
                        className="rounded border px-2 py-1"
                      >
                        {METHODS.map((m) => (
                          <option key={m.value} value={m.value}>
                            {m.label}
                          </option>
                        ))}
                      </select>
                      <button className="rounded bg-primary px-3 py-1 text-primary-foreground">تسجيل الدفعة</button>
                    </form>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">آخر الدفعات</h2>
        <ul className="space-y-2">
          {payments.map((p) => (
            <li key={p.id} className="border rounded p-3">
              <div className="font-semibold">
                إيصال {p.receiptNo} - {formatDinars(p.amount)}
              </div>
              <div className="text-sm text-muted-foreground">
                {p.invoice.enrollment.student.user?.fullName ?? "-"} / {p.method} / {p.paidAt.toISOString().slice(0, 10)}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
