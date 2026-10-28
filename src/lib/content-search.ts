import { db } from "@/lib/db";
import { normalizeArabic } from "@/lib/arabic";

export async function searchLessons(q: string) {
  const nq = normalizeArabic(q);
  if (!nq) return [];
  return db.lesson.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      searchText: { contains: nq },
    },
    include: { unit: { include: { levelSubject: { include: { level: true, subject: true } } } } },
    take: 20,
  });
}
