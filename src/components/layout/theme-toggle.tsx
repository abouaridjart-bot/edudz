"use client";

import { Moon, Sun } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/** يبدّل صنف dark على <html> ويحفظ الاختيار. الأيقونات تتبع CSS لتجنب عدم تطابق الهيدرة. */
export function ThemeToggle() {
  const t = useTranslations("common");

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch {
      /* التخزين غير متاح: يبقى التغيير للجلسة الحالية */
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("toggleTheme")} title={t("toggleTheme")}>
      <Sun className="hidden size-5 dark:block" aria-hidden />
      <Moon className="size-5 dark:hidden" aria-hidden />
    </Button>
  );
}
