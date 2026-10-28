import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap, Lock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/lib/auth";
import { Alert } from "@/components/ui/alert";

function isRedirect(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const t = await getTranslations("auth");
  const app = await getTranslations("app");

  async function login(formData: FormData) {
    "use server";
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      await signIn("credentials", { identifier, password, redirectTo: "/" });
    } catch (err) {
      // نجاح الدخول يرمي NEXT_REDIRECT أيضاً — يجب تمريره لا اعتراضه
      if (isRedirect(err)) throw err;
      redirect("/login?error=1");
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-secondary/60 via-background to-background p-4">
      <div className="w-full max-w-md space-y-5">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-md font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GraduationCap className="size-7 text-primary" aria-hidden />
          <span className="text-xl">{app("name")}</span>
        </Link>

        <div className="panel p-6 shadow-md md:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">{t("loginTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("loginSubtitle")}</p>

          {error ? (
            <div className="mt-4">
              <Alert variant="error">{t("invalid")}</Alert>
            </div>
          ) : null}

          <form action={login} className="mt-6 space-y-4">
            <label className="block space-y-1.5">
              <span className="field-label">{t("identifier")}</span>
              <input
                name="identifier"
                autoComplete="username"
                inputMode="email"
                dir="ltr"
                required
                className="field-input text-start"
              />
            </label>

            <label className="block space-y-1.5">
              <span className="field-label">{t("password")}</span>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                dir="ltr"
                required
                className="field-input text-start"
              />
            </label>

            <button
              type="submit"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {t("signIn")}
            </button>
          </form>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            {t("secureNote")}
          </p>
        </div>
      </div>
    </main>
  );
}
