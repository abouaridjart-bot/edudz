import { db } from "@/lib/db";
import type { Actor } from "@/lib/permissions";

export async function logAudit(
  actor: Actor,
  action: string,
  entity: string,
  entityId?: string,
  meta?: Record<string, unknown>,
) {
  try {
    await db.auditLog.create({
      data: {
        centerId: actor.centerId,
        actorId: actor.id,
        action,
        entity,
        entityId,
        meta: (meta as unknown as object) ?? undefined,
      },
    });
  } catch {
    // لا نُفشل العملية بسبب فشل التسجيل
  }
}
