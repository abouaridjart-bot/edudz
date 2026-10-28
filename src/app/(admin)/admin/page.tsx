import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, BookOpen, Building2, FileText, GraduationCap, Layers, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "read", "center")) redirect("/");

  const [centers, levels, subjects, units, lessons, published, users] = await Promise.all([
    db.center.count(),
    db.level.count(),
    db.subject.count(),
    db.unit.count(),
    db.lesson.count(),
    db.lesson.count({ where: { status: "PUBLISHED" } }),
    db.user.count({ where: { deletedAt: null } }),
  ]);

  const t = await getTranslations("shell");
  const modules = [
    { href: "/admin/curriculum", label: t("curriculum"), description: "المستويات والمواد ومعاملاتها", icon: BookOpen },
    { href: "/admin/units", label: t("units"), description: "وحدات المنهاج ودروسها", icon: Layers },
    { href: "/admin/lessons", label: t("lessons"), description: "محتوى الدروس وحالة النشر", icon: FileText },
    { href: "/admin/years", label: t("years"), description: "السنوات الدراسية والفصول", icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("adminTitle")} description="نظرة عامة على محتوى المنصة والمراكز المسجلة." />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="المراكز" value={String(centers)} hint="مركز مسجّل" icon={Building2} />
        <StatCard label="المستخدمون" value={String(users)} hint="حساب نشط" icon={Users} />
        <StatCard label="الدروس" value={String(lessons)} hint={`${published} منشور`} icon={FileText} />
        <StatCard label="المستويات والمواد" value={`${levels} / ${subjects}`} hint="مستوى / مادة" icon={BookOpen} />
      </div>

      <section className="grid gap-3 sm:grid-cols-2">
        {modules.map(({ href, label, description, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="panel flex items-center gap-3 p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold">{label}</p>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <ArrowLeft className="ms-auto size-4 text-muted-foreground" aria-hidden />
          </Link>
        ))}
      </section>

      <p className="text-sm text-muted-foreground">
        إجمالي الوحدات: <span className="font-semibold text-foreground">{units}</span> وحدة.
      </p>
    </div>
  );
}
