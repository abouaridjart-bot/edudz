import { redirect } from "next/navigation";
import { CalendarRange } from "lucide-react";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function YearsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "center")) redirect("/");

  const years = await db.academicYear.findMany({ include: { terms: true }, orderBy: { startDate: "desc" } });

  return (
    <div className="space-y-6">
      <PageHeader title="السنوات الدراسية" description="السنوات الدراسية المعتمدة وفصولها." />

      {years.length === 0 ? (
        <EmptyState icon={CalendarRange} title="لا توجد سنوات دراسية" description="أضف السنة الدراسية الحالية وفصولها." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {years.map((y) => (
            <li key={y.id} className="panel space-y-3 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-bold">{y.label}</p>
                {y.isCurrent ? <ToneBadge tone="success">الحالية</ToneBadge> : <ToneBadge tone="neutral">مؤرشفة</ToneBadge>}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="ltr-isolate">
                  {formatDate(y.startDate)} → {formatDate(y.endDate)}
                </span>
              </p>
              {y.terms.length > 0 ? (
                <ul className="space-y-1 border-t pt-3 text-sm">
                  {y.terms.map((t) => (
                    <li key={t.id} className="flex items-center justify-between gap-2">
                      <span>الفصل {t.number}</span>
                      <span className="text-muted-foreground ltr-isolate">
                        {formatDate(t.startDate)} → {formatDate(t.endDate)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t pt-3 text-sm text-muted-foreground">لا توجد فصول مسجلة.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
