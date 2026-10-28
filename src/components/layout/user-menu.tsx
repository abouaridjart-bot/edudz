import { LogOut } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { roleLabel } from "@/lib/labels";

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

export async function UserMenu({ name, role }: { name?: string | null; role?: string | null }) {
  const t = await getTranslations("shell");
  return (
    <div className="flex items-center gap-1">
      <div className="hidden max-w-40 text-end leading-tight sm:block">
        <div className="truncate text-sm font-semibold">{name ?? "—"}</div>
        <div className="truncate text-xs text-muted-foreground">{roleLabel(role)}</div>
      </div>
      <form action={logout}>
        <Button type="submit" variant="ghost" size="icon" aria-label={t("logout")} title={t("logout")}>
          <LogOut className="size-5" aria-hidden />
        </Button>
      </form>
    </div>
  );
}
