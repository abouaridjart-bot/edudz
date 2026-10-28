import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell, type ShellNavItem } from "@/components/layout/app-shell";
import { canList } from "@/lib/permissions";
import { getActor } from "@/lib/session";

const CENTER_ROLES = ["CENTER_OWNER", "BRANCH_MANAGER", "SECRETARY"] as const;

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!(CENTER_ROLES as readonly string[]).includes(actor.role)) redirect("/");

  const t = await getTranslations("shell");
  const nav: ShellNavItem[] = [
    { label: t("dashboard"), href: "/center", icon: "dashboard" },
    ...(canList(actor, "read", "student") ? [{ label: t("students"), href: "/center/students", icon: "students" as const }] : []),
    ...(canList(actor, "read", "group") ? [{ label: t("groups"), href: "/center/groups", icon: "groups" as const }] : []),
    ...(canList(actor, "read", "session") ? [{ label: t("sessions"), href: "/center/sessions", icon: "sessions" as const }] : []),
    ...(canList(actor, "read", "attendance") ? [{ label: t("attendance"), href: "/center/attendance", icon: "attendance" as const }] : []),
    ...(canList(actor, "read", "invoice") ? [{ label: t("invoices"), href: "/center/invoices", icon: "invoices" as const }] : []),
    ...(canList(actor, "read", "payment") ? [{ label: t("payments"), href: "/center/payments", icon: "payments" as const }] : []),
    ...(canList(actor, "read", "teacher") ? [{ label: t("teachers"), href: "/center/teachers", icon: "teachers" as const }] : []),
    ...(canList(actor, "read", "branch") ? [{ label: t("branches"), href: "/center/branches", icon: "branches" as const }] : []),
    ...(canList(actor, "read", "report") ? [{ label: t("reports"), href: "/center/reports", icon: "reports" as const }] : []),
    ...(canList(actor, "create", "user") ? [{ label: t("invitations"), href: "/center/invitations", icon: "invitations" as const }] : []),
    { label: t("notifications"), href: "/center/notifications", icon: "notifications" },
  ];

  return (
    <AppShell title={t("centerTitle")} nav={nav}>
      {children}
    </AppShell>
  );
}
