import { z } from "zod";
import { getActor } from "@/lib/session";
import { can, type Action, type Actor, type Resource, type Target } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export type ActionResult<T> = { ok: true; data: T } | { ok: false; error: string };

/** خطأ مقصود تُعرض رسالته للمستخدم (مثل: المبلغ يتجاوز المتبقي). */
export class ActionError extends Error {}

/**
 * غلاف موحّد لأي Server Action:
 * التحقق من الجلسة → تحليل المدخلات بـ Zod → فحص الصلاحية على الهدف → التنفيذ → التسجيل في AuditLog.
 */
export async function withAction<TInput, TData, TOutput>(opts: {
  input: unknown;
  schema: z.ZodType<TData, z.ZodTypeDef, TInput>;
  resource: Resource;
  action: Action;
  getTarget: (input: TData) => Target | Promise<Target>;
  audit?: {
    entity: string;
    getEntityId?: (input: TData, result: TOutput) => string | undefined;
    getMeta?: (input: TData, result: TOutput) => Record<string, unknown>;
  };
  execute: (input: TData, actor: Actor) => Promise<TOutput>;
}): Promise<ActionResult<TOutput>> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "غير مصرح" };

  const parsed = opts.schema.safeParse(opts.input);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { ok: false, error: first && first.length > 0 ? first : "بيانات غير صالحة" };
  }

  const input = parsed.data;

  let target: Target;
  try {
    target = await opts.getTarget(input);
  } catch {
    return { ok: false, error: "تعذّر التحقق من البيانات" };
  }

  if (!can(actor, opts.action, opts.resource, target)) {
    return { ok: false, error: "غير مصرح" };
  }

  try {
    const result = await opts.execute(input, actor);
    if (opts.audit) {
      await logAudit(
        actor,
        opts.action,
        opts.audit.entity,
        opts.audit.getEntityId?.(input, result),
        opts.audit.getMeta?.(input, result),
      );
    }
    return { ok: true, data: result };
  } catch (err) {
    if (err instanceof ActionError) return { ok: false, error: err.message };
    console.error("action failed:", err);
    return { ok: false, error: "حدث خطأ غير متوقع" };
  }
}
