import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { scopeWhere } from "@/lib/permissions";

export default async function AttendancePage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "read", "attendance", { centerId: actor.centerId })) redirect("/");

  const sessions = await db.session.findMany({
    where: scopeWhere(actor),
    include: { group: true, room: true, teacher: { include: { user: true } } },
    orderBy: { date: "desc" },
    take: 30,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الحضور</h1>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-semibold">{s.group.name} - {s.date.toISOString().slice(0, 10)}</div>
            <div className="text-sm text-muted-foreground">
              {s.startTime} - {s.endTime} / {s.room.name} / {s.teacher.user.fullName} / {s.status}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
