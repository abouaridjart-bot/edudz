import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

export default async function NotificationsCenterPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: actor.id },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الإشعارات</h1>
      <ul className="space-y-2">
        {notifications.map((n) => (
          <li key={n.id} className="border rounded p-3">
            <div className="font-semibold">{n.titleAr}</div>
            <div className="text-sm text-muted-foreground">{n.bodyAr}</div>
          </li>
        ))}
      </ul>
    </main>
  );
}
