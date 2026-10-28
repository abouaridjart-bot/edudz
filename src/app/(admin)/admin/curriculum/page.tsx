import { redirect } from "next/navigation";
import { BookOpen } from "lucide-react";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { cycleLabel } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function CurriculumAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "curriculum")) redirect("/");

  const [levels, subjects, levelSubjects] = await Promise.all([
    db.level.findMany({ orderBy: { order: "asc" } }),
    db.subject.findMany({ orderBy: { code: "asc" } }),
    db.levelSubject.findMany({ include: { level: true, subject: true }, orderBy: [{ levelId: "asc" }, { subjectId: "asc" }] }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader title="إدارة المنهاج" description="المستويات، المواد، والربط بينهما مع المعامل والحجم الساعي." />

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="font-bold">المستويات</h2>
            <ToneBadge tone="neutral">{levels.length}</ToneBadge>
          </div>
          {levels.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={BookOpen} title="لا توجد مستويات" />
            </div>
          ) : (
            <ul className="divide-y">
              {levels.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-2 p-3">
                  <div>
                    <p className="font-semibold">{l.nameAr}</p>
                    <p className="text-xs text-muted-foreground ltr-isolate">{l.code}</p>
                  </div>
                  <ToneBadge tone="info">{cycleLabel(l.cycle)}</ToneBadge>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="font-bold">المواد</h2>
            <ToneBadge tone="neutral">{subjects.length}</ToneBadge>
          </div>
          {subjects.length === 0 ? (
            <div className="p-4">
              <EmptyState icon={BookOpen} title="لا توجد مواد" />
            </div>
          ) : (
            <ul className="divide-y">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 p-3">
                  <p className="font-semibold">{s.nameAr}</p>
                  <span className="text-xs text-muted-foreground ltr-isolate">{s.code}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b p-4">
          <h2 className="font-bold">ربط مستوى / مادة</h2>
          <ToneBadge tone="neutral">{levelSubjects.length}</ToneBadge>
        </div>
        {levelSubjects.length === 0 ? (
          <div className="p-4">
            <EmptyState icon={BookOpen} title="لا توجد روابط" description="أضف ربط المواد بالمستويات من بيانات المنهاج." />
          </div>
        ) : (
          <ul className="divide-y">
            {levelSubjects.map((ls) => (
              <li key={ls.id} className="flex flex-wrap items-center justify-between gap-2 p-3">
                <div>
                  <p className="font-semibold">
                    {ls.level.nameAr} · {ls.subject.nameAr}
                  </p>
                  {ls.sourceNote ? <p className="text-xs text-muted-foreground">ملاحظة: {ls.sourceNote}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  <ToneBadge tone="neutral">معامل {ls.coefficient ?? "—"}</ToneBadge>
                  <ToneBadge tone="neutral">{ls.weeklyHours ?? "—"} ساعة/أسبوع</ToneBadge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
