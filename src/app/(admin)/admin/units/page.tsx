import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function UnitsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "lesson")) redirect("/");

  const units = await db.unit.findMany({
    include: { levelSubject: { include: { level: true, subject: true } }, lessons: true },
    orderBy: [{ levelSubjectId: "asc" }, { order: "asc" }],
    take: 100,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">إدارة الوحدات والدروس</h1>
      <ul className="space-y-2">
        {units.map((u) => (
          <li key={u.id} className="border rounded p-3">
            <div className="font-semibold">{u.title} (ترتيب: {u.order})</div>
            <div className="text-sm text-muted-foreground">
              {u.levelSubject.level.code} - {u.levelSubject.subject.nameAr} / عدد الدروس: {u.lessons.length}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
