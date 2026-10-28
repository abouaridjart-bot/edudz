import { redirect } from "next/navigation";
import { FileText } from "lucide-react";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { publishStatus, visibilityLabel } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge, ToneBadge } from "@/components/ui/status-badge";

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
    <div className="space-y-6">
      <PageHeader title="الدروس" description="آخر الدروس المضافة مع حالة النشر ونطاق الظهور." />

      {lessons.length === 0 ? (
        <EmptyState icon={FileText} title="لا توجد دروس" description="ستظهر الدروس بعد إضافتها إلى الوحدات." />
      ) : (
        <ul className="space-y-2">
          {lessons.map((l) => (
            <li key={l.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
              <div className="min-w-0">
                <p className="truncate font-semibold">{l.title}</p>
                <p className="text-sm text-muted-foreground">
                  {l.unit.levelSubject.level.nameAr} · {l.unit.levelSubject.subject.nameAr} · {formatDate(l.createdAt)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <ToneBadge tone="neutral">{visibilityLabel(l.visibility).label}</ToneBadge>
                <StatusBadge status={publishStatus(l.status)} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
