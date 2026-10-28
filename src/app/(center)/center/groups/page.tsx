import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { canList } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function GroupsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "group")) redirect("/");

  const groups = await db.group.findMany({
    where: scopeWhere(actor),
    include: { branch: true, level: true, subject: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ø§Ù„Ø£ÙÙˆØ§Ø¬</h1>
      <ul className="space-y-2">
        {groups.map((g) => (
          <li key={g.id} className="border rounded p-3">
            <div className="font-semibold">{g.name}</div>
            <div className="text-sm text-muted-foreground">
              {g.branch.name} / {g.level.code} - {g.subject.nameAr} / Ø§Ù„Ø³Ø¹Ø©: {g.capacity}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
