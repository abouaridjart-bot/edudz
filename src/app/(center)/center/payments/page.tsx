import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function PaymentsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "create", "payment", { centerId: actor.centerId })) redirect("/");

  const payments = await db.payment.findMany({
    where: scopeWhere(actor),
    include: { invoice: { include: { enrollment: { include: { student: { include: { user: true } } } } } } },
    orderBy: { paidAt: "desc" },
    take: 50,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">المدفوعات والإيصالات</h1>
      <ul className="space-y-2">
        {payments.map((p) => (
          <li key={p.id} className="border rounded p-3">
            <div className="font-semibold">إيصال {p.receiptNo} - {p.amount} دج</div>
            <div className="text-sm text-muted-foreground">
              {p.invoice.enrollment.student.user?.fullName ?? "-"} / {p.method} / {p.paidAt.toISOString().slice(0, 10)}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
