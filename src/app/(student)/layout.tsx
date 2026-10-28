import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";
import { getActor } from "@/lib/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "STUDENT") redirect("/");

  const t = await getTranslations("shell");
  const nav = [
    { label: t("dashboard"), href: "/student/dashboard", icon: "dashboard" as const },
    { label: t("quizzes"), href: "/student/quizzes", icon: "quizzes" as const },
  ];

  return (
    <AppShell title={t("studentTitle")} nav={nav}>
      {children}
    </AppShell>
  );
}
