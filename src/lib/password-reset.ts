import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function createPasswordReset(params: { userId: string; expiresInHours?: number }) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (params.expiresInHours ?? 2) * 60 * 60 * 1000);
  return db.passwordResetToken.create({
    data: {
      userId: params.userId,
      token,
      expiresAt,
    },
  });
}

export async function validatePasswordReset(token: string) {
  const pr = await db.passwordResetToken.findUnique({ where: { token } });
  if (!pr) throw new Error("invalid_token");
  if (pr.usedAt) throw new Error("already_used");
  if (pr.expiresAt < new Date()) throw new Error("expired");
  return pr;
}
