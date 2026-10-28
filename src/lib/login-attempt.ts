import { db } from "@/lib/db";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;

export async function checkLoginAttempts(identifier: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
  const attempts = await db.loginAttempt.count({
    where: {
      identifier: identifier.toLowerCase(),
      success: false,
      createdAt: { gte: since },
    },
  });
  return attempts < MAX_ATTEMPTS;
}

export async function recordLoginAttempt(identifier: string, success: boolean, ip?: string) {
  try {
    await db.loginAttempt.create({
      data: {
        identifier: identifier.toLowerCase(),
        success,
        ip,
      },
    });
  } catch {
    // ignore
  }
}
