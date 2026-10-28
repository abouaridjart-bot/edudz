"use client";

import { TriangleAlert } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("common");
  return (
    <main id="content" className="container flex min-h-dvh items-center justify-center py-10">
      <div className="panel flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <TriangleAlert className="size-6" aria-hidden />
        </span>
        <h1 className="text-xl font-bold">{t("errorTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("errorRetry")}</p>
        <Button onClick={reset} className="mt-2">
          {t("errorRetry")}
        </Button>
      </div>
    </main>
  );
}
