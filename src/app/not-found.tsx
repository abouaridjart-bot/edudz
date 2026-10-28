import Link from "next/link";
import { SearchX } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main id="content" className="container flex min-h-dvh items-center justify-center py-10">
      <div className="panel flex w-full max-w-md flex-col items-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SearchX className="size-6" aria-hidden />
        </span>
        <p className="text-4xl font-extrabold text-primary">404</p>
        <h1 className="text-xl font-bold">{t("notFoundTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("notFoundText")}</p>
        <Link href="/" className={buttonVariants({ className: "mt-2" })}>
          {t("backHome")}
        </Link>
      </div>
    </main>
  );
}
