import Link from "next/link";
import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getEnv } from "@/lib/env";

function isRedirect(err: unknown): boolean {
  const digest = (err as { digest?: unknown } | null)?.digest;
  return typeof digest === "string" && digest.startsWith("NEXT_REDIRECT");
}

async function loginAction(formData: FormData) {
  "use server";
  const identifier = String(formData.get("identifier") ?? "");
  const password = String(formData.get("password") ?? "");
  
  try {
    // استدعاء API route مباشرة بدلاً من signIn
    const response = await fetch(`${getEnv().NEXT_PUBLIC_APP_URL}/api/auth/callback/credentials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        identifier,
        password,
        callbackUrl: getEnv().NEXT_PUBLIC_APP_URL + "/",
        json: "true"
      }),
    });

    const data = await response.json();
    
    if (!response.ok || data.error) {
      redirect("/login?error=1");
    }

    redirect("/");
  } catch (err) {
    if (isRedirect(err)) throw err;
    redirect("/login?error=1");
  }
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; activated?: string }>;
}) {
  const { error, activated } = await searchParams;
  const t = await getTranslations("auth");
  const app = await getTranslations("app");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 group transition-all hover:scale-105"
        >
          <div className="p-2.5 bg-white rounded-xl shadow-lg border border-indigo-100/80">
            <GraduationCap className="size-7 text-indigo-600" aria-hidden />
          </div>
          <span className="text-2xl font-bold text-indigo-900 tracking-tight">{app("name")}</span>
        </Link>

        <div className="relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] overflow-hidden border border-white/40 p-8 md:p-10">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 bg-indigo-500/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 size-24 bg-blue-500/10 rounded-full blur-2xl" />

          <div className="relative z-10">
            {activated ? (
              <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <p className="text-sm text-emerald-800 font-medium leading-relaxed">
                  تم تفعيل الحساب بنجاح. سجّل الدخول بكلمة المرور الجديدة.
                </p>
              </div>
            ) : null}

            {error ? (
              <div className="mb-6 p-4 bg-rose-50/80 border border-rose-100 rounded-xl flex items-start gap-3 backdrop-blur-sm">
                <p className="text-sm text-rose-800 font-medium leading-relaxed">{t("invalid")}</p>
              </div>
            ) : null}

            <form action={loginAction} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-indigo-950/80 mr-1">
                  {t("identifier")}
                </label>
                <input
                  name="identifier"
                  autoComplete="username"
                  inputMode="email"
                  dir="ltr"
                  required
                  className="w-full h-12 px-4 bg-white/60 border border-indigo-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-indigo-200 text-indigo-950 font-medium text-start shadow-sm"
                  placeholder="name@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-indigo-950/80 mr-1">
                  {t("password")}
                </label>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  dir="ltr"
                  required
                  className="w-full h-12 px-4 bg-white/60 border border-indigo-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-indigo-200 text-indigo-950 font-medium text-start shadow-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                className="group relative w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/50 active:scale-[0.98] transition-all"
              >
                <span>{t("signIn")}</span>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-indigo-50 flex flex-col items-center gap-4 text-xs font-medium text-indigo-950/50 text-center">
              <p className="flex items-center gap-1.5">
                {t("secureNote")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
