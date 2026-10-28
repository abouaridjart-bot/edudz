import Link from "next/link";
import { GraduationCap, KeyRound, ShieldAlert } from "lucide-react";
import { db } from "@/lib/db";
import { roleLabel } from "@/lib/labels";
import { Alert } from "@/components/ui/alert";
import { activateAccount } from "./actions";

export const metadata = { robots: { index: false, follow: false } };

export default async function ActivatePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; error?: string }>;
}) {
  const { token, error } = await searchParams;

  const invitation = token ? await db.invitation.findUnique({ where: { token } }) : null;
  const user = invitation?.email
    ? await db.user.findFirst({
        where: {
          email: invitation.email,
          ...(invitation.centerId ? { centerId: invitation.centerId } : {}),
        },
        select: { fullName: true, isActive: true },
      })
    : null;

  const problem =
    !token || !invitation
      ? "رابط التفعيل غير صالح أو ناقص. تأكد من نسخ الرابط كاملاً."
      : invitation.acceptedAt
        ? "استُعمل هذا الرابط مسبقاً. سجّل الدخول أو اطلب دعوة جديدة."
        : invitation.expiresAt < new Date()
          ? "انتهت صلاحية رابط التفعيل. اطلب من المركز إرسال دعوة جديدة."
          : !user
            ? "لا يوجد حساب مرتبط بهذه الدعوة. تواصل مع المركز."
            : user.isActive
              ? "هذا الحساب مفعّل مسبقاً. يمكنك تسجيل الدخول مباشرة."
              : null;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-secondary/60 via-background to-background p-4">
      <div className="w-full max-w-md space-y-5">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 rounded-md font-extrabold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <GraduationCap className="size-7 text-primary" aria-hidden />
          <span className="text-xl">EduDZ</span>
        </Link>

        <div className="panel p-6 shadow-md md:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight">تفعيل الحساب</h1>

          {problem || !invitation || !user ? (
            <div className="mt-4 space-y-4">
              <Alert variant="error">{problem ?? "رابط التفعيل غير صالح"}</Alert>
              <Link
                href="/login"
                className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border px-4 text-sm font-semibold transition-colors hover:bg-muted"
              >
                الذهاب إلى تسجيل الدخول
              </Link>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-muted-foreground">
                مرحباً <span className="font-semibold text-foreground">{user?.fullName}</span> —{" "}
                {roleLabel(invitation.role)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground" dir="ltr">
                {invitation.email}
              </p>

              {error ? (
                <div className="mt-4">
                  <Alert variant="error">{error}</Alert>
                </div>
              ) : null}

              <form action={activateAccount} className="mt-6 space-y-4">
                <input type="hidden" name="token" value={token} />

                <label className="block space-y-1.5">
                  <span className="field-label">كلمة المرور الجديدة</span>
                  <input
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    dir="ltr"
                    required
                    minLength={8}
                    maxLength={128}
                    className="field-input text-start"
                  />
                </label>

                <label className="block space-y-1.5">
                  <span className="field-label">تأكيد كلمة المرور</span>
                  <input
                    name="confirm"
                    type="password"
                    autoComplete="new-password"
                    dir="ltr"
                    required
                    minLength={8}
                    maxLength={128}
                    className="field-input text-start"
                  />
                </label>

                <p className="text-xs text-muted-foreground">
                  8 محارف على الأقل، مع حرف ورقم واحد على الأقل. تُخزَّن كلمة المرور مشفّرة ولا يراها أحد.
                </p>

                <button
                  type="submit"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <KeyRound className="size-4" aria-hidden />
                  تفعيل الحساب
                </button>
              </form>
            </>
          )}

          <p className="mt-5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldAlert className="size-3.5" aria-hidden />
            الرابط صالح لمدة 72 ساعة ولمرة واحدة فقط.
          </p>
        </div>
      </div>
    </main>
  );
}
