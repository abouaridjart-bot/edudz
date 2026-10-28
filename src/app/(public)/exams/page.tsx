import { db } from "@/lib/db";

export default async function ExamsPage() {
  const exams = await db.examArchive.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { year: "desc" },
    take: 50,
    include: { levelSubject: { include: { level: true, subject: true } } },
  });
  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-bold">أرشيف الامتحانات</h1>
      <ul className="space-y-2">
        {exams.map((e) => (
          <li key={e.id} className="border rounded p-3">
            <div className="font-semibold">{e.levelSubject.subject.nameAr} - {e.kind}</div>
            <div className="text-sm text-muted-foreground">{e.levelSubject.level.code} / {e.year}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
