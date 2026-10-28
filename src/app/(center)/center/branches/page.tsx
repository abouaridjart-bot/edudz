import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { canList } from "@/lib/permissions";
import { db } from "@/lib/db";
import { allowedBranchIds, requireCenterId } from "@/lib/permissions";

export default async function BranchesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "branch")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const branches = await db.branch.findMany({
    where: { centerId: requireCenterId(actor), ...(branchIds ? { id: { in: branchIds } } : {}) },
    include: { rooms: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الفروع والقاعات</h1>
      <ul className="space-y-2">
        {branches.map((b) => (
          <li key={b.id} className="border rounded p-3">
            <div className="font-semibold">{b.name}</div>
            <div className="text-sm text-muted-foreground">عدد القاعات: {b.rooms.length}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
