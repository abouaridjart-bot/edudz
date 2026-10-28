import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function TeacherDashboardPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">لوحة الأستاذ</h1>
      <p className="text-muted-foreground">حصصي، الحضور، الواجبات، النتائج</p>
    </main>
  );
}
