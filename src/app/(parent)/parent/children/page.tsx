import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function ParentChildrenPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "PARENT") redirect("/");

  const parent = await db.parent.findUnique({
    where: { userId: actor.id },
    include: { children: { include: { student: { include: { user: true, branch: true } } } } },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">أبنائي</h1>
      <ul className="space-y-2">
        {(parent?.children ?? []).map((ps) => (
          <li key={ps.studentId} className="border rounded p-3">
            <div className="font-semibold">{ps.student.user?.fullName ?? "-"}</div>
            <div className="text-sm text-muted-foreground">{ps.student.branch?.name}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
