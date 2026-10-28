import { redirect } from "next/navigation";
import { BarChart3, CalendarCheck2, CircleDollarSign, TriangleAlert, UsersRound } from "lucide-react";
import { canList } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { ToneBadge } from "@/components/ui/status-badge";

const REPORTS = [
  { title: "الإيرادات", text: "التحصيل الشهري حسب الفرع وطريقة الدفع.", icon: CircleDollarSign },
  { title: "المتأخرات", text: "الفواتير غير المسددة وأعمار الدين.", icon: TriangleAlert },
  { title: "الحضور", text: "نسب الحضور والغياب لكل فوج وطالب.", icon: CalendarCheck2 },
  { title: "امتلاء الأفواج", text: "المقاعد المتاحة ونسب الاستغلال.", icon: UsersRound },
] as const;

export default async function ReportsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "report")) redirect("/");

  return (
    <div className="space-y-6">
      <PageHeader title="التقارير" description="تقارير تشغيلية ومالية للمركز. التقارير التفصيلية قيد الإنشاء." />

      <ul className="grid gap-3 sm:grid-cols-2">
        {REPORTS.map(({ title, text, icon: Icon }) => (
          <li key={title} className="panel flex items-start gap-3 p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{title}</p>
                <ToneBadge tone="neutral">قريباً</ToneBadge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <div className="panel flex items-center gap-3 p-4 text-sm text-muted-foreground">
        <BarChart3 className="size-5 shrink-0 text-primary" aria-hidden />
        تُبنى التقارير على بيانات الفواتير والدفعات والحضور المسجلة فعلياً، دون أي أرقام تقديرية.
      </div>
    </div>
  );
}
