import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations();
  return (
    <AppShell title={t("shell.studentTitle")} nav={[{ label: t("shell.dashboard"), href: "/student" }]}>
      {children}
    </AppShell>
  );
}
