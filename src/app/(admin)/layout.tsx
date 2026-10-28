import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell, type ShellNavItem } from "@/components/layout/app-shell";
import { canList } from "@/lib/permissions";
import { getActor } from "@/lib/session";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "SUPER_ADMIN") redirect("/");

  const t = await getTranslations("shell");
  const nav: ShellNavItem[] = [
    { label: t("dashboard"), href: "/admin", icon: "dashboard" },
    ...(canList(actor, "read", "curriculum") ? [{ label: t("curriculum"), href: "/admin/curriculum", icon: "curriculum" as const }] : []),
    ...(canList(actor, "read", "lesson") ? [{ label: t("units"), href: "/admin/units", icon: "units" as const }] : []),
    ...(canList(actor, "read", "lesson") ? [{ label: t("lessons"), href: "/admin/lessons", icon: "lessons" as const }] : []),
    ...(canList(actor, "read", "center") ? [{ label: t("years"), href: "/admin/years", icon: "years" as const }] : []),
  ];

  return (
    <AppShell title={t("adminTitle")} nav={nav}>
      {children}
    </AppShell>
  );
}
