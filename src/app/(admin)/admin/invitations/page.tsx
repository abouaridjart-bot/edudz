import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function InvitationsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!can(actor, "create", "user", { centerId: actor.centerId })) redirect("/");

  const invites = await db.invitation.findMany({
    where: actor.centerId ? { centerId: actor.centerId } : {},
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">الدعوات</h1>
      <ul className="space-y-2">
        {invites.map((i) => (
          <li key={i.id} className="border rounded p-3">
            <div className="font-semibold">{i.role}</div>
            <div className="text-sm text-muted-foreground">
              {i.email ?? i.phone ?? "-"} / حالة: {i.acceptedAt ? "مقبولة" : i.expiresAt < new Date() ? "منتهية" : "نشطة"}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
