import { redirect } from "next/navigation";
import { Bell } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { formatDateTime } from "@/lib/dates";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function NotificationsCenterPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="الإشعارات"
        description="تنبيهات الحساب والمركز."
        actions={unread > 0 ? <ToneBadge tone="info">{unread} غير مقروء</ToneBadge> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="لا توجد إشعارات" description="ستظهر هنا التنبيهات المتعلقة بحسابك." />
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li key={n.id} className="panel flex items-start gap-3 p-4">
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bell className="size-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{n.titleAr}</p>
                  {!n.read ? <ToneBadge tone="info">جديد</ToneBadge> : null}
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{n.bodyAr}</p>
                <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(n.createdAt)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
