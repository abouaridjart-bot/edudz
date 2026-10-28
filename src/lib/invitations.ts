import { db } from "@/lib/db";
import { randomBytes } from "crypto";

export async function createInvitation(params: {
  centerId: string;
  role: string;
  email?: string;
  phone?: string;
  invitedById: string;
  expiresInHours?: number;
}) {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + (params.expiresInHours ?? 72) * 60 * 60 * 1000);
  return db.invitation.create({
    data: {
      centerId: params.centerId,
      role: params.role as unknown as import("@prisma/client").Role,
      email: params.email ?? null,
      phone: params.phone ?? null,
      token,
      invitedBy: params.invitedById,
      expiresAt,
    },
  });
}

export async function acceptInvitation(token: string) {
  const inv = await db.invitation.findUnique({ where: { token } });
  if (!inv) throw new Error("invalid_token");
  if (inv.acceptedAt) throw new Error("already_used");
  if (inv.expiresAt < new Date()) throw new Error("expired");
  return inv;
}
