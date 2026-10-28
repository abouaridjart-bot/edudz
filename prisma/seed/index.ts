/**
 * seed:base — بيانات تمهيدية للمنهاج والولايات. آمن لإعادة التشغيل (upsert).
 * لا يكتب معاملات ولا أحجاماً ساعية (تُدخل من لوحة المشرف). التشغيل: npm run db:seed
 */
import { PrismaClient } from "@prisma/client";
import { LEVELS, SEED_SOURCE_NOTE, STREAMS, SUBJECTS, WILAYAS } from "./data";

const prisma = new PrismaClient();

async function main() {
  for (const w of WILAYAS) {
    await prisma.wilaya.upsert({
      where: { id: w.id },
      update: { nameAr: w.nameAr, nameFr: w.nameFr },
      create: { ...w, sourceNote: SEED_SOURCE_NOTE },
    });
  }

  const levelIds = new Map<string, string>();
  for (const l of LEVELS) {
    const row = await prisma.level.upsert({
      where: { code: l.code },
      update: { cycle: l.cycle, nameAr: l.nameAr, nameFr: l.nameFr, order: l.order },
      create: l,
    });
    levelIds.set(l.code, row.id);
  }

  for (const s of STREAMS) {
    const levelId = levelIds.get(s.levelCode);
    if (!levelId) throw new Error(`Unknown level code in streams seed: ${s.levelCode}`);
    await prisma.stream.upsert({
      where: { levelId_code: { levelId, code: s.code } },
      update: { nameAr: s.nameAr, nameFr: s.nameFr },
      create: { levelId, code: s.code, nameAr: s.nameAr, nameFr: s.nameFr },
    });
  }

  for (const s of SUBJECTS) {
    await prisma.subject.upsert({
      where: { code: s.code },
      update: { nameAr: s.nameAr, nameFr: s.nameFr },
      create: s,
    });
  }

  console.log(
    `seed:base OK — wilayas=${WILAYAS.length}, levels=${LEVELS.length}, streams=${STREAMS.length}, subjects=${SUBJECTS.length}`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
