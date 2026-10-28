import { getActor } from "@/lib/session";
import { redirect } from "next/navigation";
import { branchWhere, canList, scopeWhere } from "@/lib/permissions";
import { db } from "@/lib/db";
import { StudentForm } from "./student-form";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "student")) redirect("/");

  const [students, branches, levels, streams] = await Promise.all([
    db.student.findMany({
      where: scopeWhere(actor),
      include: { user: true, branch: true, level: true, stream: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    db.branch.findMany({
      where: branchWhere(actor),
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
    db.level.findMany({
      select: { id: true, nameAr: true },
      orderBy: { order: "asc" },
    }),
    db.stream.findMany({
      select: { id: true, levelId: true, nameAr: true },
      orderBy: { nameAr: "asc" },
    }),
  ]);

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">الطلاب</h1>

      {ok ? (
        <p role="status" className="rounded border border-green-600/40 bg-green-600/10 p-3 text-sm">
          {ok}
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="rounded border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {canList(actor, "create", "student") ? (
        <StudentForm branches={branches} levels={levels} streams={streams} />
      ) : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">قائمة الطلاب ({students.length})</h2>
        {students.length === 0 ? (
          <p className="rounded border border-dashed p-3 text-sm text-muted-foreground">لا يوجد طلاب بعد.</p>
        ) : (
          <ul className="space-y-2">
            {students.map((s) => (
              <li key={s.id} className="border rounded p-3">
                <div className="font-semibold">{s.user?.fullName ?? "-"}</div>
                <div className="text-sm text-muted-foreground">
                  {s.branch?.name ?? "-"} / {s.level?.nameAr ?? "-"}
                  {s.stream ? ` / ${s.stream.nameAr}` : ""}
                  {s.user?.phone ? ` / ${s.user.phone}` : ""}
                  {s.user && !s.user.isActive ? " / الحساب غير مفعّل" : ""}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
