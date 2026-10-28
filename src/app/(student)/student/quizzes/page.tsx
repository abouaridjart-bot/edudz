import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function StudentQuizzesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "STUDENT" && actor.role !== "PARENT") redirect("/");

  const quizzes = await db.quiz.findMany({
    include: { lesson: true, questions: true },
    take: 20,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الاختبارات</h1>
      <ul className="space-y-2">
        {quizzes.map((q) => (
          <li key={q.id} className="border rounded p-3">
            <div className="font-semibold">{q.title}</div>
            <div className="text-sm text-muted-foreground">عدد الأسئلة: {q.questions.length} / أقصى محاولات: {q.maxAttempts}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
