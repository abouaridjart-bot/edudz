import { PrismaClient } from "@prisma/client";

/** عميل Prisma الوحيد في المشروع. لا تستورد PrismaClient من أي مكان آخر. */
const globalForPrisma = globalThis as unknown as {
  prisma?: ReturnType<typeof createRetryClient>;
};

/**
 * سكون Neon: بعد الخمول يفشل أول استعلام بـ P1001 (Can't reach database server)
 * أو انخفاض توفر الاتصالات لثوانٍ. نعيد المحاولة مرة واحدة بعد مهلة قصيرة
 * عبر Query Extension الرسمي في Prisma 6. أي خطأ آخر يمر دون تدخل.
 */
function isColdStart(err: unknown): boolean {
  const e = err as { code?: unknown; message?: unknown } | null;
  const message = String(e?.message ?? err);
  return (
    e?.code === "P1001" ||
    message.includes("Can't reach database server") ||
    message.includes("Timed out fetching a new connection")
  );
}

function createRetryClient() {
  return new PrismaClient().$extends({
    query: {
      $allModels: {
        async $allOperations({ args, query }) {
          try {
            return await query(args);
          } catch (err) {
            if (!isColdStart(err)) throw err;
            await new Promise((r) => setTimeout(r, 1500));
            return await query(args);
          }
        },
      },
    },
  });
}

export const db = globalForPrisma.prisma ?? createRetryClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
