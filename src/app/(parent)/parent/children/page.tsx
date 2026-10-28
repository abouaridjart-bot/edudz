import { redirect } from "next/navigation";
import { Users } from "lucide-react";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ToneBadge } from "@/components/ui/status-badge";

export default async function ParentChildrenPage() {
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (actor.role !== "PARENT") redirect("/");

  const parent = await db.parent.findUnique({
    where: { userId: actor.id },
    include: {
      children: {
        include: {
          student: {
            include: {
              user: true,
              branch: true,
              level: true,
              enrollments: { where: { status: "ACTIVE" }, include: { group: { include: { subject: true } } } },
            },
          },
        },
      },
    },
  });

  const children = parent?.children ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title="أبنائي" description="بيانات كل ابن وأفواجه النشطة." />

      {children.length === 0 ? (
        <EmptyState icon={Users} title="لا يوجد أبناء مرتبطون" description="تواصل مع إدارة المركز لربط حسابك بأبنائك." />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {children.map(({ student }) => (
            <li key={student.id} className="panel space-y-3 p-4">
              <div>
                <p className="font-bold">{student.user?.fullName ?? "—"}</p>
                <p className="text-sm text-muted-foreground">
                  {student.branch?.name ?? "—"} · {student.level?.nameAr ?? "—"}
                </p>
              </div>
              {student.enrollments.length > 0 ? (
                <ul className="space-y-1 border-t pt-3">
                  {student.enrollments.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-2 text-sm">
                      <span>{e.group.name}</span>
                      <ToneBadge tone="neutral">{e.group.subject.nameAr}</ToneBadge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="border-t pt-3 text-sm text-muted-foreground">لا توجد أفواج نشطة.</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
