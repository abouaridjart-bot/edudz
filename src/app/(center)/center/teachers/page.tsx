import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function TeachersPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "teacher", { centerId: actor.centerId })) redirect("/");

  const teachers = await db.teacher.findMany({
    where: scopeWhere(actor),
    include: { user: true },
    orderBy: { id: "asc" },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الأساتذة</h1>
      <ul className="space-y-2">
        {teachers.map((t) => (
          <li key={t.id} className="border rounded p-3">
            <div className="font-semibold">{t.user.fullName}</div>
            <div className="text-sm text-muted-foreground">{t.user.phone ?? "-"}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
