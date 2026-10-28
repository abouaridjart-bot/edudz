import { redirect } from "next/navigation";
import { Mail } from "lucide-react";
import { canList, requireCenterId } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDate } from "@/lib/dates";
import { roleLabel } from "@/lib/labels";
import { PageHeader } from "@/components/ui/page-header";
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="الدعوات"
        description="دعوات تفعيل الحسابات (طلاب، أولياء، أساتذة). إرسال الدعوات تلقائياً قيد الإنشاء."
      />

      {invites.length === 0 ? (
        <EmptyState icon={Mail} title="لا توجد دعوات" description="ستظهر هنا دعوات تفعيل الحسابات الصادرة من المركز." />
      ) : (
        <ul className="space-y-2">
          {invites.map((i) => {
            const state = inviteState(i);
            return (
              <li key={i.id} className="panel flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{roleLabel(i.role)}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="ltr-isolate">{i.email ?? i.phone ?? "—"}</span> · تنتهي{" "}
                    {formatDate(i.expiresAt)}
                  </p>
                </div>
                <ToneBadge tone={state.tone}>{state.label}</ToneBadge>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
