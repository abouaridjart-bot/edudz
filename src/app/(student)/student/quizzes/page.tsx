import { redirect } from "next/navigation";
import { ClipboardList } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function StudentQuizzesPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "STUDENT") redirect("/");

  const quizzes = await db.quiz.findMany({
    include: { lesson: true, questions: true },
    take: 20,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="الاختبارات" description="اختبارات ذاتية التصحيح مرتبطة بالدروس." />

      {quizzes.length === 0 ? (
        <EmptyState icon={ClipboardList} title="لا توجد اختبارات" description="ستظهر الاختبارات بعد نشرها من طرف الأساتذة." />
      ) : (
        <ul className="space-y-2">
          {quizzes.map((q) => (
            <li key={q.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{q.title}</p>
                <p className="text-sm text-muted-foreground">
                  {q.lesson ? q.lesson.title : "بدون درس"} · {q.questions.length} سؤال
                </p>
              </div>
              <ToneBadge tone="neutral">حتى {q.maxAttempts} محاولات</ToneBadge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
