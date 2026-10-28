import { db } from "@/lib/db";
import { notFound } from "next/navigation";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = await db.lesson.findUnique({
    where: { id },
    include: { unit: { include: { levelSubject: { include: { level: true, subject: true } } } }, attachments: true },
  });
  if (!lesson || lesson.status !== "PUBLISHED") notFound();
  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      <p className="text-muted-foreground">{lesson.unit.levelSubject.subject.nameAr} - {lesson.unit.levelSubject.level.code}</p>
      <article className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: lesson.body.replace(/\n/g, "<br/>") }} />
      {lesson.attachments.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">المرفقات</h2>
          <ul className="list-disc pr-6">
            {lesson.attachments.map((a) => (
              <li key={a.id}>{a.fileName ?? a.storageKey}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
