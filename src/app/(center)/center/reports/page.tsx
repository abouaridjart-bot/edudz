import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";

export default async function ReportsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "report", { centerId: actor.centerId })) redirect("/");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">التقارير</h1>
      <ul className="grid gap-2 md:grid-cols-2">
        <li className="border rounded p-3">الإيرادات</li>
        <li className="border rounded p-3">المتأخرات</li>
        <li className="border rounded p-3">الحضور</li>
        <li className="border rounded p-3">امتلاء الأفواج</li>
      </ul>
    </main>
  );
}
