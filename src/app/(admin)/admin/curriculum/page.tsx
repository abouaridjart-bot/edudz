import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function CurriculumAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "curriculum")) redirect("/");

  const [levels, subjects, levelSubjects] = await Promise.all([
    db.level.findMany({ orderBy: { code: "asc" } }),
    db.subject.findMany({ orderBy: { code: "asc" } }),
    db.levelSubject.findMany({ include: { level: true, subject: true }, orderBy: { levelId: "asc" } }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">إدارة المنهاج</h1>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">المستويات</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {levels.map((l) => (
            <li key={l.id} className="border rounded p-3">{l.code} - {l.cycle}</li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">المواد</h2>
        <ul className="grid gap-2 md:grid-cols-2">
          {subjects.map((s) => (
            <li key={s.id} className="border rounded p-3">{s.code} - {s.nameAr}</li>
          ))}
        </ul>
      </section>
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">ربط مستوى/مادة</h2>
        <ul className="grid gap-2">
          {levelSubjects.map((ls) => (
            <li key={ls.id} className="border rounded p-3">
              {ls.level.code} / {ls.subject.nameAr} — معامل: {ls.coefficient ?? "-"}، حجم ساعي: {ls.weeklyHours ?? "-"}
              {ls.sourceNote && <span className="text-xs text-muted-foreground block">ملاحظة: {ls.sourceNote}</span>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
