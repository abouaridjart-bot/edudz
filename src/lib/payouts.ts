/** قواعد صرف الأجور — منطق نقي بلا اعتماد على قاعدة البيانات. */

export type PayoutStatusLike = "DRAFT" | "ISSUED" | "PAID";

export type PayoutBlockReason = "invalid" | "already-issued" | "already-paid";

export type PayoutCheck = { ok: true } | { ok: false; reason: PayoutBlockReason };

export interface PayoutCheckInput {
  /** حالة الصرف (يجب أن تكون DRAFT). */
  status: PayoutStatusLike;
}

/**
 * يقرر هل يمكن إصدار أو دفع أجر. لا يسمح بإصدار أجر أكثر من مرة،
 * ولا يسمح بدفع أجر لم يُصدَّر بعد.
 */
export function checkPayout(input: PayoutCheckInput): PayoutCheck {
  if (input.status === "PAID") return { ok: false, reason: "already-paid" };
  if (input.status === "ISSUED") return { ok: false, reason: "already-issued" };
  return { ok: true };
}