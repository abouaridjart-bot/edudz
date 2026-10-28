import { db } from "@/lib/db";

export default async function CurriculumPage() {
  const levels = await db.level.findMany({ orderBy: { code: "asc" } });
  return (
    <main className="container py-10 space-y-4">
      <h1 className="text-2xl font-bold">المنهاج</h1>
      <ul className="grid gap-2 md:grid-cols-2">
        {levels.map((l) => (
          <li key={l.id} className="border rounded p-3">{l.code} — {l.cycle}</li>
        ))}
      </ul>
    </main>
  );
}
