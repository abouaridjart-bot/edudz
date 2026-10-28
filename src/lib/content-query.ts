import { db } from "@/lib/db";
import type { Actor } from "@/lib/permissions";

export async function getVisibleLessons(actor: Actor | null, filters: { unitId?: string } = {}) {
  const baseWhere: Record<string, unknown> = {
    status: "PUBLISHED",
    ...(filters.unitId ? { unitId: filters.unitId } : {}),
  };

  if (!actor) {
    return db.lesson.findMany({
      where: { ...baseWhere, visibility: "PUBLIC" },
      include: { unit: { include: { levelSubject: { include: { level: true, subject: true } } } } },
      orderBy: { createdAt: "asc" },
    });
  }

  return db.lesson.findMany({
    where: {
      ...baseWhere,
      OR: [
        { visibility: "PUBLIC" },
        { visibility: "CENTER", centerId: actor.centerId },
      ],
    },
    include: { unit: { include: { levelSubject: { include: { level: true, subject: true } } } } },
    orderBy: { createdAt: "asc" },
  });
}

export async function getVisibleExamArchives(actor: Actor | null) {
  if (!actor) {
    return db.examArchive.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { year: "desc" },
      include: { levelSubject: { include: { level: true, subject: true } } },
    });
  }
  return db.examArchive.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { levelSubject: {} }, // simplified for now
      ],
    },
    orderBy: { year: "desc" },
    include: { levelSubject: { include: { level: true, subject: true } } },
  });
}
