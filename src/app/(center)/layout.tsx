import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function CenterLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  return (
    <AppShell title={t("shell.centerTitle")} nav={[{ label: t("shell.dashboard"), href: "/center" }]}>
      {children}
    </AppShell>
  );
}
