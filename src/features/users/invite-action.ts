"use server";

import { z } from "zod";
import { randomBytes } from "crypto";
import { getActor } from "@/lib/session";
import { can } from "@/lib/permissions";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";

const schema = z.object({
  identifier: z.string().min(1),
  role: z.enum(["TEACHER", "SECRETARY", "BRANCH_MANAGER", "PARENT", "CENTER_OWNER"]),
});

export async function inviteUser(formData: FormData) {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "غير مصرح" };

  const parsed = schema.safeParse({
    identifier: formData.get("identifier"),
    role: formData.get("role"),
  });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const { identifier, role } = parsed.data;
  const target = { centerId: actor.centerId };
  if (!can(actor, "create", "user", target)) {
    return { ok: false, error: "غير مصرح" };
  }

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const email = identifier.includes("@") ? identifier.toLowerCase() : null;
  const phone = !email ? identifier : null;

  await db.invitation.create({
    data: {
      centerId: actor.centerId,
      email,
      phone,
      role,
      token,
      invitedBy: actor.id,
      expiresAt,
    },
  });

  await logAudit(actor, "create", "invitation", undefined, { role, email, phone });

  // Return token for now (notification channel to be implemented later)
  return { ok: true, token };
}
