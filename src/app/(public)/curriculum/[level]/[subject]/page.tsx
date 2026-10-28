import { db } from "@/lib/db";

export default async function CurriculumLevelSubjectPage({ params }: { params: Promise<{ level: string; subject: string }> }) {
  const { level, subject } = await params;
  const levelSubject = await db.levelSubject.findFirst({
    where: { level: { code: level }, subject: { code: subject } },
    include: { units: { include: { lessons: { where: { status: "PUBLISHED", visibility: "PUBLIC" }, orderBy: { createdAt: "asc" } } }, orderBy: { order: "asc" } } },
  });

  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-bold">{level} - {subject}</h1>
      <ul className="space-y-3">
        {(levelSubject?.units ?? []).map((u) => (
          <li key={u.id} className="border rounded p-3">
            <div className="font-semibold">{u.title}</div>
            <ul className="mt-2 pr-6 list-disc space-y-1">
              {u.lessons.map((l) => (
                <li key={l.id}><a className="text-primary" href={`/lessons/${l.id}`}>{l.title}</a></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
