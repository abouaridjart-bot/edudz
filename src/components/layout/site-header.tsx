import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { NavLink } from "./nav-link";
import { ToolbarControls } from "./toolbar-controls";

export async function SiteHeader() {
  const t = await getTranslations();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <GraduationCap className="size-6 text-primary" aria-hidden />
          <span className="text-lg">{t("app.name")}</span>
        </Link>
        <nav aria-label="main" className="hidden items-center gap-1 md:flex">
          <NavLink href="/">{t("nav.home")}</NavLink>
          <span className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground">
            {t("nav.curriculum")} <Badge>{t("common.comingSoon")}</Badge>
          </span>
          <span className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-muted-foreground">
            {t("nav.exams")} <Badge>{t("common.comingSoon")}</Badge>
          </span>
        </nav>
        <ToolbarControls />
      </div>
    </header>
  );
}
