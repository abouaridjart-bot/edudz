import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/layout/site-header";

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("app");
  return (
    <>
      <SiteHeader />
      <main id="content">{children}</main>
      <footer className="mt-16 border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container">
          © {new Date().getFullYear()} {t("name")} — {t("tagline")}
        </div>
      </footer>
    </>
  );
}
