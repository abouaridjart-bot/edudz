import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  return (
    <AppShell title={t("shell.adminTitle")} nav={[{ label: t("shell.dashboard"), href: "/admin" }]}>
      {children}
    </AppShell>
  );
}
