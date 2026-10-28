import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { canList } from "@/lib/permissions";
import { db } from "@/lib/db";
import { allowedBranchIds, requireCenterId } from "@/lib/permissions";

export default async function SessionsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "session")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const sessions = await db.session.findMany({
    where: {
      centerId: requireCenterId(actor),
      ...(branchIds ? { group: { branchId: { in: branchIds } } } : {}),
    },
    include: { group: true, room: true, teacher: { include: { user: true } } },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 50,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ø§Ù„Ø¬Ø¯Ø§ÙˆÙ„ ÙˆØ§Ù„Ø­ØµØµ</h1>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-semibold">{s.group.name} - {s.date.toISOString().slice(0, 10)} {s.startTime} - {s.endTime}</div>
            <div className="text-sm text-muted-foreground">{s.room.name} / {s.teacher.user.fullName} / {s.status}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
