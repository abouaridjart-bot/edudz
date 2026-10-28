import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function InvoicesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "invoice", { centerId: actor.centerId })) redirect("/");

  const invoices = await db.invoice.findMany({
    where: scopeWhere(actor),
    include: { enrollment: { include: { student: { include: { user: true } }, group: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الفواتير</h1>
      <ul className="space-y-2">
        {invoices.map((inv) => (
          <li key={inv.id} className="border rounded p-3">
            <div className="font-semibold">{inv.enrollment.student.user?.fullName ?? "-"} - {inv.period}</div>
            <div className="text-sm text-muted-foreground">
              الإجمالي: {inv.total} دج / مدفوع: {inv.paid} دج / الحالة: {inv.status}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
