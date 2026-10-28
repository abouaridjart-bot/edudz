import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { signIn } from "@/lib/auth";
import { LoginForm } from "./login-form";

function isRedirect(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; activated?: string }>;
}) {
  const { error, activated } = await searchParams;
  const t = await getTranslations("auth");
  const app = await getTranslations("app");

  async function login(formData: FormData) {
    "use server";
    const identifier = String(formData.get("identifier") ?? "");
    const password = String(formData.get("password") ?? "");
    try {
      await signIn("credentials", { identifier, password, redirectTo: "/" });
    } catch (err) {
      if (isRedirect(err)) throw err;
      redirect("/login?error=1");
    }
  }

  const labels = {
    identifier: t("identifier"),
    password: t("password"),
    signIn: t("signIn"),
    secureNote: t("secureNote"),
    invalid: t("invalid"),
  };

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed bg-indigo-600/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 group transition-transform hover:scale-105"
        >
          <div className="p-2 bg-white rounded-lg shadow-sm border border-indigo-100">
            <GraduationCap className="size-8 text-indigo-600" aria-hidden />
          </div>
          <span className="text-2xl font-bold text-indigo-900 tracking-tight">{app("name")}</span>
        </Link>

        <LoginForm
          loginAction={login}
          labels={labels}
          error={!!error}
          activated={!!activated}
        />
      </div>
    </main>
  );
}
