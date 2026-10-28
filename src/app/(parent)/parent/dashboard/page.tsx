import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function ParentDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "PARENT") redirect("/");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">بوابة الولي</h1>
      <p className="text-muted-foreground">أبنائي، الغيابات، المدفوعات، الجدول</p>
    </main>
  );
}
