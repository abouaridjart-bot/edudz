import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { canList } from "@/lib/permissions";

export default async function ReportsPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "report")) redirect("/");

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Ø§Ù„ØªÙ‚Ø§Ø±ÙŠØ±</h1>
      <ul className="grid gap-2 md:grid-cols-2">
        <li className="border rounded p-3">Ø§Ù„Ø¥ÙŠØ±Ø§Ø¯Ø§Øª</li>
        <li className="border rounded p-3">Ø§Ù„Ù…ØªØ£Ø®Ø±Ø§Øª</li>
        <li className="border rounded p-3">Ø§Ù„Ø­Ø¶ÙˆØ±</li>
        <li className="border rounded p-3">Ø§Ù…ØªÙ„Ø§Ø¡ Ø§Ù„Ø£ÙÙˆØ§Ø¬</li>
      </ul>
    </main>
  );
}
