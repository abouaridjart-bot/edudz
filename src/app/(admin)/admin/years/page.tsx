import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { canRole } from "@/lib/permissions";
import { db } from "@/lib/db";

export default async function YearsAdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const role = (session.user as { role?: string }).role;
  if (!role || !canRole(role as never, "create", "center")) redirect("/");

  const years = await db.academicYear.findMany({ include: { terms: true }, orderBy: { startDate: "desc" } });

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">السنة الدراسية والفصول</h1>
      <ul className="space-y-2">
        {years.map((y) => (
          <li key={y.id} className="border rounded p-3">
            <div className="font-semibold">{y.label} {y.isCurrent && "(حالياً)"}</div>
            <div className="text-sm text-muted-foreground">
              {y.startDate.toISOString().slice(0, 10)} → {y.endDate.toISOString().slice(0, 10)}
            </div>
            <ul className="mt-2 text-sm">
              {y.terms.map((t) => (
                <li key={t.id}>الفصل {t.number}: {t.startDate.toISOString().slice(0, 10)} → {t.endDate.toISOString().slice(0, 10)}</li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </main>
  );
}
