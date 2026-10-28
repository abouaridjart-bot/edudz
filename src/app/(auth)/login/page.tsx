import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

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
    <main className="min-h-screen flex items-center justify-center p-4">
      <form action={login} className="w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">تسجيل الدخول</h1>
        {error ? (
          <p role="alert" className="text-sm text-center text-destructive">
            بيانات الدخول غير صحيحة أو الحساب موقوف
          </p>
        ) : null}
        <div className="space-y-2">
          <label className="text-sm">الهاتف أو البريد الإلكتروني</label>
          <input name="identifier" className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="space-y-2">
          <label className="text-sm">كلمة المرور</label>
          <input name="password" type="password" className="w-full border rounded px-3 py-2" required />
        </div>
        <button className="w-full bg-primary text-primary-foreground py-2 rounded">دخول</button>
      </form>
    </main>
  );
}
