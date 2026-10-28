"use server";

import { z } from "zod";
import { getActor } from "@/lib/session";
import { db } from "@/lib/db";
import { logAudit } from "@/lib/audit";
import { hashPassword } from "@/lib/password";

const schema = z.object({
  centerName: z.string().min(1),
  ownerEmail: z.string().email().optional(),
  ownerPhone: z.string().optional(),
  ownerPassword: z.string().min(6),
  ownerFullName: z.string().min(1),
});

export async function createCenterWithOwner(formData: FormData) {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "غير مصرح" };
  // Only SUPER_ADMIN can create centers
  if (actor.role !== "SUPER_ADMIN") return { ok: false, error: "غير مصرح" };

  const parsed = schema.safeParse({
    centerName: formData.get("centerName"),
    ownerEmail: formData.get("ownerEmail") || undefined,
    ownerPhone: formData.get("ownerPhone") || undefined,
    ownerPassword: formData.get("ownerPassword"),
    ownerFullName: formData.get("ownerFullName"),
  });
  if (!parsed.success) return { ok: false, error: "بيانات غير صالحة" };

  const { centerName, ownerEmail, ownerPhone, ownerPassword, ownerFullName } = parsed.data;
  if (!ownerEmail && !ownerPhone) return { ok: false, error: "يجب إدخال البريد أو الهاتف" };

  const slug = centerName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const passwordHash = await hashPassword(ownerPassword);

  const result = await db.$transaction(async (tx) => {
    const center = await tx.center.create({
      data: {
        name: centerName,
        slug: `${slug}-${Date.now().toString().slice(-6)}`,
      },
    });

    const owner = await tx.user.create({
      data: {
        centerId: center.id,
        role: "CENTER_OWNER",
        email: ownerEmail || null,
        phone: ownerPhone || null,
        passwordHash,
        fullName: ownerFullName,
        isActive: true,
      },
    });

    return { center, owner };
  });

  await logAudit(actor, "create", "center", result.center.id, { centerName });

  return { ok: true, centerId: result.center.id };
}
