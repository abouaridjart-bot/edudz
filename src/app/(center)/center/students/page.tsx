import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { branchWhere, canList, scopeWhere } from "@/lib/permissions";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { Alert } from "@/components/ui/alert";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";
import { StudentForm } from "./student-form";
import { inviteStudentAccount } from "./actions";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const { ok, error } = await searchParams;
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!canList(actor, "read", "student")) redirect("/");

  const canInvite = canList(actor, "create", "user");

  const [students, branches, levels, streams] = await Promise.all([
    db.student.findMany({
      where: { ...scopeWhere(actor), deletedAt: null },
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
    <div className="space-y-6">
      <PageHeader
        title="الطلاب"
        description="سجل الطلاب، فروعهم ومستوياتهم، وحالة تفعيل حساباتهم."
      />

      {ok ? <Alert variant="success">{ok}</Alert> : null}
      {error ? <Alert variant="error">{error}</Alert> : null}

      {canList(actor, "create", "student") ? (
        <StudentForm branches={branches} levels={levels} streams={streams} />
      ) : null}

      <section className="panel overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
          <h2 className="font-bold">قائمة الطلاب</h2>
          <ToneBadge tone="neutral">{students.length} طالب</ToneBadge>
        </div>
        {students.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={Users}
              title="لا يوجد طلاب بعد"
              description="أضف أول طالب من النموذج أعلاه، ثم أسنِده إلى فوج لإنشاء فواتيره."
            />
          </div>
        ) : (
          <ul className="divide-y">
            {students.map((s) => {
              const name = s.user?.fullName ?? "—";
              return (
                <li key={s.id} className="flex flex-wrap items-center gap-3 p-4">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {name.trim().charAt(0) || "؟"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">
                      {s.branch?.name ?? "—"} · {s.level?.nameAr ?? "—"}
                      {s.stream ? ` · ${s.stream.nameAr}` : ""}
                      {s.user?.phone ? ` · ${s.user.phone}` : ""}
                    </p>
                    {s.user?.email ? (
                      <p className="truncate text-xs text-muted-foreground" dir="ltr">
                        {s.user.email}
                      </p>
                    ) : null}
                  </div>
                  {s.user ? (
                    <ToneBadge tone={s.user.isActive ? "success" : "warning"}>
                      {s.user.isActive ? "حساب مفعّل" : "بانتظار التفعيل"}
                    </ToneBadge>
                  ) : null}
                  {canInvite && s.user && !s.user.isActive ? (
                    s.user.email ? (
                      <form action={inviteStudentAccount}>
                        <input type="hidden" name="studentId" value={s.id} />
                        <button className="inline-flex min-h-9 items-center rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted">
                          رابط تفعيل
                        </button>
                      </form>
                    ) : (
                      <span className="text-xs text-muted-foreground">أضف بريداً إلكترونياً للتفعيل</span>
                    )
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
