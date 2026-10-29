import Link from "next/link";
import { Suspense } from "react";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { FlashToaster } from "@/components/flash-toaster";
import { auth } from "@/lib/auth";
import { NavLink, type NavIcon } from "./nav-link";
import { ToolbarControls } from "./toolbar-controls";
import { UserMenu } from "./user-menu";

export interface ShellNavItem {
  label: string;
  /** بدون href = عنصر "قريباً" غير قابل للنقر. */
  href?: string;
  icon?: NavIcon;
}

/** هيكل لوحة التحكم: شريط علوي + قائمة جانبية (سطح المكتب) أو أفقية (الهاتف). */
export async function AppShell({ title, nav, children }: { title: string; nav: ShellNavItem[]; children: React.ReactNode }) {
  const [t, session] = await Promise.all([getTranslations(), auth()]);
  const user = session?.user as { name?: string | null; role?: string | null } | undefined;

  const items = nav.map((item) =>
    item.href ? (
      <NavLink key={item.label} href={item.href} icon={item.icon}>
        {item.label}
      </NavLink>
    ) : (
      <span
        key={item.label}
        className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap px-3 text-sm text-muted-foreground"
      >
        {item.label} <Badge>{t("common.comingSoon")}</Badge>
      </span>
    ),
  );

  return (
    <div className="min-h-dvh bg-muted/30">
      <Suspense fallback={null}>
        <FlashToaster />
      </Suspense>
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-md font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`${t("app.name")} — ${t("common.backHome")}`}
            >
              <GraduationCap className="size-6 text-primary" aria-hidden />
              <span className="hidden sm:inline">{t("app.name")}</span>
            </Link>
            <span className="text-muted-foreground/50" aria-hidden>
              /
            </span>
            <span className="truncate text-sm font-semibold text-muted-foreground">{title}</span>
          </div>
          <div className="flex items-center gap-1">
            {user ? <UserMenu name={user.name} role={user.role} /> : null}
            <ToolbarControls />
          </div>
        </div>
        <nav aria-label={t("shell.sectionNav")} className="container flex gap-1 overflow-x-auto pb-2 md:hidden">
          {items}
        </nav>
      </header>

      <div className="container grid gap-6 py-6 md:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <nav
            aria-label={t("shell.sectionNav")}
            className="sticky top-20 flex flex-col gap-1 rounded-xl border bg-card p-2 shadow-sm"
          >
            {items}
          </nav>
        </aside>
        <main id="content" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
