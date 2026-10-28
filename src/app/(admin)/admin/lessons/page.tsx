import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function LessonsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "lesson")) redirect("/");

  const lessons = await db.lesson.findMany({
    include: { unit: { include: { levelSubject: { include: { level: true, subject: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">إدارة الدروس</h1>
      <ul className="space-y-2">
        {lessons.map((l) => (
          <li key={l.id} className="border rounded p-3">
            <div className="font-semibold">{l.title}</div>
            <div className="text-sm text-muted-foreground">
              {l.unit.levelSubject.level.code} - {l.unit.levelSubject.subject.nameAr} / {l.status} / {l.visibility}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
