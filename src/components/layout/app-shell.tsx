import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "./nav-link";
import { ToolbarControls } from "./toolbar-controls";

export interface ShellNavItem {
  label: string;
  /** بدون href = عنصر "قريباً" غير قابل للنقر. */
  href?: string;
}

/** هيكل لوحة التحكم: شريط علوي + قائمة جانبية (سطح المكتب) أو أفقية (الهاتف). */
export async function AppShell({ title, nav, children }: { title: string; nav: ShellNavItem[]; children: React.ReactNode }) {
  const t = await getTranslations();
  const items = nav.map((item) =>
    item.href ? (
      <NavLink key={item.label} href={item.href}>
        {item.label}
      </NavLink>
    ) : (
      <span key={item.label} className="inline-flex min-h-11 items-center gap-2 whitespace-nowrap px-3 text-sm text-muted-foreground">
        {item.label} <Badge>{t("common.comingSoon")}</Badge>
      </span>
    ),
  );

  return (
    <div className="min-h-dvh bg-muted/30">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 font-bold" aria-label={t("common.backHome")}>
              <GraduationCap className="size-6 text-primary" aria-hidden />
              <span className="hidden sm:inline">{t("app.name")}</span>
            </Link>
            <span className="text-muted-foreground" aria-hidden>
              /
            </span>
            <h1 className="text-base font-bold">{title}</h1>
          </div>
          <ToolbarControls />
        </div>
        <nav aria-label="section" className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
          {items}
        </nav>
      </header>
      <div className="container grid gap-6 py-6 md:grid-cols-[14rem_1fr]">
        <nav aria-label="section" className="hidden flex-col gap-1 md:flex">
          {items}
        </nav>
        <main id="content" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
