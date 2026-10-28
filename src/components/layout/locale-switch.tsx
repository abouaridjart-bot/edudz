"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LOCALE_COOKIE, type Locale } from "@/i18n/config";

export function LocaleSwitch() {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const router = useRouter();

  function switchLocale() {
    const next: Locale = locale === "ar" ? "fr" : "ar";
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={switchLocale} lang={locale === "ar" ? "fr" : "ar"}>
      <Languages className="size-4" aria-hidden />
      {t("switchTo")}
    </Button>
  );
}
