import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function StudentsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "student", { centerId: actor.centerId })) redirect("/");

  const students = await db.student.findMany({
    where: scopeWhere(actor),
    include: { user: true, branch: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الطلاب</h1>
      <ul className="space-y-2">
        {students.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-semibold">{s.user?.fullName ?? "-"}</div>
            <div className="text-sm text-muted-foreground">{s.branch?.name}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
