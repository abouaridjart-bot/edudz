/** العلامات من 20، بخطوة 0.25، وتُعرض بفاصلة عشرية (14,25). */
export const MAX_GRADE = 20;

export function isValidGrade(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= MAX_GRADE && Number.isInteger(value * 4);
}

export function roundToQuarter(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError("value must be finite");
  const clamped = Math.min(MAX_GRADE, Math.max(0, value));
  return Math.round(clamped * 4) / 4;
}

/** 14.25 → "14,25" · 14 → "14" · 14.5 → "14,5" */
export function formatGrade(value: number): string {
  return String(value).replace(".", ",");
}

/** يحوّل نتيجة (score من max) إلى /20 مقرّبة لخانتين. */
export function scaleTo20(score: number, max: number): number {
  if (!Number.isFinite(score) || !Number.isFinite(max) || max <= 0) throw new RangeError("invalid score/max");
  if (score < 0 || score > max) throw new RangeError("score must be within 0..max");
  return Math.round((score / max) * MAX_GRADE * 100) / 100;
}

export interface GradeItem {
  grade: number | null;
  coefficient: number | null;
}

/**
 * المعدل بالمعاملات. العناصر التي علامتها أو معاملها غير معروف (null) تُستبعد،
 * فإن لم يبق شيء يُرجع null (لا نخمّن معاملات رسمية).
 */
export function weightedAverage(items: GradeItem[]): number | null {
  let sum = 0;
  let weights = 0;
  for (const { grade, coefficient } of items) {
    if (grade === null || coefficient === null || coefficient <= 0) continue;
    sum += grade * coefficient;
    weights += coefficient;
  }
  if (weights === 0) return null;
  return Math.round((sum / weights) * 100) / 100;
}
