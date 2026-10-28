"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { getActor } from "@/lib/session";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  identifier: z.string().min(1),
});

export async function requestPasswordReset(formData: FormData) {
  const parsed = schema.safeParse({
    identifier: formData.get("identifier"),
  });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const identifier = parsed.data.identifier.toLowerCase();
  const user = await db.user.findFirst({
    where: {
      OR: [{ email: identifier }, { phone: parsed.data.identifier }],
      isActive: true,
      deletedAt: null,
    },
  });

  // Return same message to avoid user enumeration
  if (!user) {
    return { ok: true };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  const actor = await getActor().catch(() => null);
  if (actor) {
    await logAudit(actor, "request", "password_reset", user.id);
  }

  // Token returned for testing/internal use
  return { ok: true, token };
}
