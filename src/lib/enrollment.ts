/** قواعد تسجيل طالب في فوج — منطق نقي بلا اعتماد على قاعدة البيانات. */

export type GroupStatusLike = "ACTIVE" | "PAUSED" | "CLOSED";

export type EnrollmentBlockReason = "invalid" | "group-not-active" | "already-enrolled" | "full";

export type EnrollmentCheck = { ok: true } | { ok: false; reason: EnrollmentBlockReason };

export interface EnrollmentCheckInput {
  /** سعة الفوج (عدد الطلاب). */
  capacity: number;
  /** عدد التسجيلات النشطة حالياً. */
  activeCount: number;
  /** هل الطالب مسجّل نشطاً في نفس الفوج؟ */
  alreadyActive: boolean;
  groupStatus: GroupStatusLike;
}

/**
 * يقرر هل يمكن إضافة تسجيل نشط جديد. لا يسمح بالتجاوز ولا بالتكرار،
 * ويقبل الأفواج النشطة فقط. الأعداد يجب أن تكون أعداداً صحيحة غير سالبة.
 */
export function checkEnrollment(input: EnrollmentCheckInput): EnrollmentCheck {
  if (!Number.isSafeInteger(input.capacity) || input.capacity < 0) return { ok: false, reason: "invalid" };
  if (!Number.isSafeInteger(input.activeCount) || input.activeCount < 0) return { ok: false, reason: "invalid" };
  if (input.groupStatus !== "ACTIVE") return { ok: false, reason: "group-not-active" };
  if (input.alreadyActive) return { ok: false, reason: "already-enrolled" };
  if (input.activeCount >= input.capacity) return { ok: false, reason: "full" };
  return { ok: true };
}

/** المقاعد المتبقية في الفوج (لا تقل عن صفر). */
export function remainingSeats(capacity: number, activeCount: number): number {
  if (!Number.isSafeInteger(capacity) || !Number.isSafeInteger(activeCount)) return 0;
  return Math.max(0, capacity - Math.max(0, activeCount));
}
