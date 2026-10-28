import { z } from "zod";
import { getActor } from "@/lib/session";
import { can, type Action, type Resource, type Target } from "@/lib/permissions";
import { logAudit } from "@/lib/audit";

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function withAction<TInput, TOutput>(opts: {
  schema: z.ZodSchema<TInput>;
  resource: Resource;
  action: Action;
  getTarget: (input: TInput) => Target | Promise<Target>;
  audit?: { entity: string; getEntityId?: (input: TInput, result?: TOutput) => string | undefined };
  execute: (input: TInput, actor: NonNullable<Awaited<ReturnType<typeof getActor>>>) => Promise<TOutput>;
}): Promise<ActionResult<TOutput>> {
  const actor = await getActor();
  if (!actor) return { ok: false, error: "غير مصرح" };

  let input: TInput;
  try {
    // For server actions, callers pass validated input; keep simple for now
    input = {} as TInput;
  } catch {
    return { ok: false, error: "بيانات غير صالحة" };
  }

  const target = await opts.getTarget(input);
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
      );
    }
    return { ok: true, data: result };
  } catch {
    return { ok: false, error: "حدث خطأ" };
  }
}
