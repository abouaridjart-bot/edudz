import { Construction } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function CenterPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  const allowed = role === "CENTER_OWNER" || role === "BRANCH_MANAGER" || role === "SECRETARY";
  if (!allowed) redirect("/");
  
  const t = await getTranslations("shell");
  return (
    <Card>
      <CardHeader>
        <Construction className="size-8 text-primary" aria-hidden />
        <CardTitle>{t("centerTitle")}</CardTitle>
        <CardDescription>{t("centerText")}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Badge className="w-fit">{t("underConstruction")}</Badge>
        <p className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">{t("authNotice")}</p>
      </CardContent>
    </Card>
  );
}
