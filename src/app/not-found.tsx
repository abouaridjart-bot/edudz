import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { buttonVariants } from "@/components/ui/button";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main id="content" className="container flex min-h-dvh flex-col items-start justify-center gap-4">
      <p className="text-6xl font-extrabold text-primary">404</p>
      <h1 className="text-2xl font-bold">{t("notFoundTitle")}</h1>
      <p className="text-muted-foreground">{t("notFoundText")}</p>
      <Link href="/" className={buttonVariants()}>
        {t("backHome")}
      </Link>
    </main>
  );
}
