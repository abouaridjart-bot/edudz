import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { canList, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { getEnv } from "@/lib/env";
import { roleLabel } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { CopyField } from "@/components/ui/copy-field";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

function inviteState(invite: { acceptedAt: Date | null; expiresAt: Date }) {
  if (invite.acceptedAt) return { label: "مقبولة", tone: "success" as const };
  if (invite.expiresAt < new Date()) return { label: "منتهية", tone: "danger" as const };
  return { label: "نشطة", tone: "info" as const };
}

export default async function CenterInvitationsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "create", "user")) redirect("/");

  const invites = await db.invitation.findMany({
    where: { centerId: requireCenterId(actor) },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const baseUrl = getEnv().NEXT_PUBLIC_APP_URL.replace(/\/+$/, "");
  const pending = invites.filter((i) => !i.acceptedAt && i.expiresAt >= new Date());

  return (
    <div className="space-y-6">
      <PageHeader
        title="الدعوات"
        description="روابط تفعيل حسابات الطلاب والأولياء والأساتذة. أرسل الرابط للشخص المعني ليختار كلمة مروره بنفسه."
      />

      <Alert variant="info">
        لا يوجد إرسال بريد تلقائي بعد: انسخ رابط التفعيل وأرسله للشخص (واتساب، بريد، أو رسالة). الرابط صالح 72 ساعة ولمرة واحدة.
      </Alert>

      {invites.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="لا توجد دعوات"
          description="أنشئ رابط تفعيل من قائمة الطلاب (زر «رابط تفعيل») ليظهر هنا."
        />
      ) : (
        <ul className="space-y-2">
          {pending.length > 0 ? (
            <li className="text-sm font-semibold text-muted-foreground">روابط سارية ({pending.length})</li>
          ) : null}
          {invites.map((i) => {
            const state = inviteState(i);
            return (
              <li key={i.id} className="panel space-y-3 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{roleLabel(i.role)}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="ltr-isolate">{i.email ?? i.phone ?? "—"}</span> · تنتهي{" "}
                      {formatDate(i.expiresAt)}
                    </p>
                  </div>
                  <ToneBadge tone={state.tone}>{state.label}</ToneBadge>
                </div>
                {!i.acceptedAt && i.expiresAt >= new Date() ? (
                  <CopyField value={`${baseUrl}/activate?token=${i.token}`} label="رابط التفعيل" />
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
