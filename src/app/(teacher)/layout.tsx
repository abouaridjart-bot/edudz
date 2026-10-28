import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { AppShell } from "@/components/layout/app-shell";
import { getActor } from "@/lib/session";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "TEACHER") redirect("/");

  const t = await getTranslations("shell");
  const nav = [
    { label: t("dashboard"), href: "/teacher/dashboard", icon: "dashboard" as const },
    { label: t("sessions"), href: "/teacher/sessions", icon: "sessions" as const },
    { label: t("attendance"), href: "/teacher/attendance", icon: "attendance" as const },
  ];

  return (
    <AppShell title={t("teacherTitle")} nav={nav}>
      {children}
    </AppShell>
  );
}
