import { redirect } from "next/navigation";
import { Calculator, TrendingDown, TrendingUp } from "lucide-react";
import { canList, allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { ExpenseForm } from "./expense-form";
import { FinancialSummary } from "./financial-summary";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "expense")) redirect("/");

  const branchIds = allowedBranchIds(actor);
  const branches = await db.branch.findMany({
    where: branchIds ? { id: { in: branchIds } } : {},
    select: { id: true, name: true },
  });

  const categories = [
    "رواتب",
    "إيجار",
    "كهرباء ومياه",
    "إنترنت",
    "مواد تعليمية",
    "صيانة",
    "نقل",
    "أخرى",
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="التقارير المالية"
        description="إدارة المصاريف وصرف الأجور وتتبع المركز المالي."
      />

      {ok ? <Alert variant="success">{ok}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ExpenseForm branches={branches} categories={categories} />
          <FinancialSummary />
        </div>

        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="mb-4 font-semibold">إحصائيات إضافية</h3>
            <p className="text-sm text-muted-foreground">سيتم إضافة المزيد من الرسوم البيانية والإحصائيات قريباً.</p>
          </div>

          <div className="panel p-4">
            <h3 className="mb-4 font-semibold">معلومات</h3>
            <p className="text-sm text-muted-foreground">
              هذه الشاشة للإدارة المالية الأساسية. يمكن تسجيل المصاريف وإدارة الأجور.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
