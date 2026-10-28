import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardCheck,
  ReceiptText,
  TriangleAlert,
  Users,
  UsersRound,
  Wallet,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { db } from "@/lib/db";
import { formatDinars } from "@/lib/money";
import { formatDate, formatDateLong, todayInAlgiers, startOfMonthInAlgiers } from "@/lib/dates";
import { allowedBranchIds, requireCenterId } from "@/lib/permissions";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { payMethod, sessionStatus } from "@/lib/labels";

export default async function CenterPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  const centerId = requireCenterId(actor);
  const branchIds = allowedBranchIds(actor);
  const t = await getTranslations("shell");

  const studentScope = branchIds ? { branchId: { in: branchIds } } : {};
  const groupScope = branchIds ? { branchId: { in: branchIds } } : {};
  const sessionScope = branchIds ? { group: { branchId: { in: branchIds } } } : {};
  const invoiceScope = branchIds ? { enrollment: { student: { branchId: { in: branchIds } } } } : {};
  const today = todayInAlgiers();

  const [students, groups, todaySessions, openInvoices, monthPayments, recentPayments] = await Promise.all([
    db.student.count({ where: { centerId, deletedAt: null, ...studentScope } }),
    db.group.count({ where: { centerId, status: "ACTIVE", ...groupScope } }),
    db.session.findMany({
      where: { centerId, date: today, ...sessionScope },
      include: { group: true, room: true, teacher: { include: { user: true } } },
      orderBy: { startTime: "asc" },
      take: 8,
    }),
    db.invoice.aggregate({
      where: { centerId, status: { in: ["ISSUED", "PARTIAL"] }, ...invoiceScope },
      _sum: { total: true, paid: true },
    }),
    db.payment.aggregate({
      where: {
        centerId,
        paidAt: { gte: startOfMonthInAlgiers() },
        ...(branchIds ? { branchId: { in: branchIds } } : {}),
      },
      _sum: { amount: true },
    }),
    db.payment.findMany({
      where: { centerId, ...(branchIds ? { branchId: { in: branchIds } } : {}) },
      include: { invoice: { include: { enrollment: { include: { student: { include: { user: true } } } } } } },
      orderBy: { paidAt: "desc" },
      take: 5,
    }),
  ]);

  const outstanding = (openInvoices._sum.total ?? 0) - (openInvoices._sum.paid ?? 0);
  const monthTotal = monthPayments._sum.amount ?? 0;

  const links = [
    { href: "/center/students", label: t("students"), icon: Users },
    { href: "/center/groups", label: t("groups"), icon: UsersRound },
    { href: "/center/sessions", label: t("sessions"), icon: CalendarDays },
    { href: "/center/attendance", label: t("attendance"), icon: ClipboardCheck },
    { href: "/center/invoices", label: t("invoices"), icon: ReceiptText },
    { href: "/center/payments", label: t("payments"), icon: Wallet },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("centerTitle")} description={`ملخص ${formatDateLong(new Date())}`} />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="الطلاب" value={String(students)} hint="طالب مسجّل" icon={Users} />
        <StatCard label="الأفواج النشطة" value={String(groups)} hint="فوج مفتوح" icon={UsersRound} />
        <StatCard label="حصص اليوم" value={String(todaySessions.length)} hint={formatDate(today)} icon={CalendarDays} />
        <StatCard
          label="المتأخرات"
          value={formatDinars(outstanding)}
          hint="على الفواتير غير المسددة"
          icon={TriangleAlert}
          className={outstanding > 0 ? "border-amber-500/40" : undefined}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="font-bold">حصص اليوم</h2>
            <Link href="/center/sessions" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
              كل الحصص <ArrowLeft className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="p-4">
            {todaySessions.length === 0 ? (
              <EmptyState icon={CalendarDays} title="لا توجد حصص اليوم" description="ستظهر هنا الحصص المبرمجة لهذا اليوم." />
            ) : (
              <ul className="divide-y">
                {todaySessions.map((s) => (
                  <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{s.group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {s.startTime}–{s.endTime} · {s.room.name} · {s.teacher.user.fullName}
                      </p>
                    </div>
                    <StatusBadge status={sessionStatus(s.status)} />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <section className="panel">
          <div className="flex items-center justify-between gap-2 border-b p-4">
            <h2 className="font-bold">التحصيل هذا الشهر</h2>
            <p className="text-sm font-semibold text-primary">{formatDinars(monthTotal)}</p>
          </div>
          <div className="p-4">
            {recentPayments.length === 0 ? (
              <EmptyState icon={Wallet} title="لا توجد دفعات بعد" description="سجّل أول دفعة من صفحة المدفوعات." />
            ) : (
              <ul className="divide-y">
                {recentPayments.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.invoice.enrollment.student.user?.fullName ?? "—"}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(p.paidAt)} · {payMethod(p.method).label} · <span className="ltr-isolate">{p.receiptNo}</span>
                      </p>
                    </div>
                    <span className="font-semibold tabular-nums">{formatDinars(p.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-bold">إجراءات سريعة</h2>
          <Link href="/center/invoices" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            حالة الفواتير
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="panel flex items-center gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="font-semibold">{label}</span>
              <ArrowLeft className="ms-auto size-4 text-muted-foreground" aria-hidden />
            </Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-muted-foreground">
        آخر تحديث: {formatDate(new Date())} · الأموال بالدينار الجزائري (DZD)
      </p>
    </div>
  );
}
