import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Actor } from "@/lib/permissions";

export async function getActor(): Promise<Actor | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      role: true,
      centerId: true,
      isActive: true,
      deletedAt: true,
    },
  });

  if (!user || !user.isActive || user.deletedAt) return null;

  const branchIds: string[] = [];
  const childStudentIds: string[] = [];

  if ((user.role === "BRANCH_MANAGER" || user.role === "SECRETARY") && user.centerId) {
    try {
      const staff = await db.branchStaff.findMany({
        where: { userId: user.id },
        select: { branchId: true },
      });
      staff.forEach((s) => branchIds.push(s.branchId));
    } catch {
      // ignore
    }
  }

  if (user.role === "PARENT") {
    const parent = await db.parent.findUnique({
      where: { userId: user.id },
      include: { children: { select: { studentId: true } } },
    });
    if (parent) {
      parent.children.forEach((c) => childStudentIds.push(c.studentId));
    }
  }

  return {
    id: user.id,
    role: user.role as Actor["role"],
    centerId: user.centerId,
    branchIds,
    childStudentIds,
  };
}
