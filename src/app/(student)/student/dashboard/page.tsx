import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";

export default async function StudentDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "lesson", { ownerId: actor.id })) redirect("/");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">لوحة الطالب</h1>
      <p className="text-muted-foreground">تقدمي، واجباتي، نتائجي، جدولي</p>
    </main>
  );
}
