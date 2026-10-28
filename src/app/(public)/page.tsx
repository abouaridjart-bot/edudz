import { BookOpenCheck, School } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const t = await getTranslations("home");
  const common = await getTranslations("common");

  const cycles = [
    { key: "primary", title: t("primary"), text: t("primaryText") },
    { key: "middle", title: t("middle"), text: t("middleText") },
    { key: "secondary", title: t("secondary"), text: t("secondaryText") },
  ];

  return (
    <>
      <section className="bg-gradient-to-b from-secondary/70 to-background">
        <div className="container py-14 md:py-20">
          <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.4] md:text-5xl md:leading-[1.35]">{t("heroTitle")}</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">{t("heroText")}</p>
        </div>
      </section>

      <section className="container grid gap-4 py-10 md:grid-cols-2">
        <Card>
          <CardHeader>
            <BookOpenCheck className="size-8 text-primary" aria-hidden />
            <CardTitle>{t("partATitle")}</CardTitle>
            <CardDescription>{t("partAText")}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <School className="size-8 text-primary" aria-hidden />
            <CardTitle>{t("partBTitle")}</CardTitle>
            <CardDescription>{t("partBText")}</CardDescription>
          </CardHeader>
        </Card>
      </section>

      <section className="container py-6">
        <h2 className="mb-4 text-2xl font-bold">{t("cyclesTitle")}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {cycles.map((c) => (
            <Card key={c.key}>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{c.title}</CardTitle>
                  <Badge>{common("comingSoon")}</Badge>
                </div>
                <CardDescription>{c.text}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
    </>
  );
}
