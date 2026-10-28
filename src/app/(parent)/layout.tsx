import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";
import { getActor } from "@/lib/session";

export default async function ParentLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "PARENT") redirect("/");

  const t = await getTranslations("shell");
  const nav = [
    { label: t("dashboard"), href: "/parent/dashboard", icon: "dashboard" as const },
    { label: t("children"), href: "/parent/children", icon: "children" as const },
  ];

  return (
    <AppShell title={t("parentTitle")} nav={nav}>
      {children}
    </AppShell>
  );
}
