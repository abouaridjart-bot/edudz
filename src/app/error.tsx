"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <main id="content" className="container flex min-h-dvh flex-col items-start justify-center gap-4">
      <h1 className="text-2xl font-bold">{t("errorTitle")}</h1>
      <Button onClick={reset}>{t("errorRetry")}</Button>
    </main>
  );
}
