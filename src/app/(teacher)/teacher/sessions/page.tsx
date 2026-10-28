import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function TeacherSessionsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  const teacher = await db.teacher.findUnique({ where: { userId: actor.id } });
  if (!teacher) redirect("/");

  const sessions = await db.session.findMany({
    where: { teacherId: teacher.id },
    include: { group: true, room: true },
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
    take: 40,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">حصصي</h1>
      <ul className="space-y-2">
        {sessions.map((s) => (
          <li key={s.id} className="border rounded p-3">
            <div className="font-semibold">{s.group.name} - {s.date.toISOString().slice(0, 10)} {s.startTime}-{s.endTime}</div>
            <div className="text-sm text-muted-foreground">{s.room.name} / {s.status}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
