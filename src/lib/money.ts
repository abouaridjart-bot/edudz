import { toWesternDigits } from "./digits";

/**
 * كل المبالغ أعداد صحيحة بالدينار الجزائري (DZD). ممنوع Float.
 * التقريب دائماً "نصف لأعلى" (half-up) للقيم غير السالبة.
 */
export type Dinar = number;

const NBSP = "\u00A0";

export function isDinars(value: unknown): value is Dinar {
  return typeof value === "number" && Number.isSafeInteger(value);
}

export function assertDinars(value: unknown, label = "amount"): asserts value is Dinar {
  if (!isDinars(value)) {
    throw new RangeError(`${label} must be a safe integer number of dinars, got ${String(value)}`);
  }
}

export function addDinars(...values: number[]): Dinar {
  let sum = 0;
  for (const v of values) {
    assertDinars(v);
    sum += v;
  }
  assertDinars(sum, "sum");
  return sum;
}

/** نسبة مئوية من مبلغ (تقبل حتى خانتين عشريتين في النسبة، مثل 37.5). */
export function percentOf(amount: Dinar, pct: number): Dinar {
  assertDinars(amount);
  if (amount < 0) throw new RangeError("amount must be >= 0");
  if (!Number.isFinite(pct) || pct < 0 || pct > 100) throw new RangeError("pct must be between 0 and 100");
  const basisPoints = Math.round(pct * 100);
  return Math.floor((amount * basisPoints + 5000) / 10000);
}

export function applyDiscount(amount: Dinar, discountPct: number): Dinar {
  return amount - percentOf(amount, discountPct);
}

/** تناسب جزئي: حصة usedUnits من totalUnits (أيام أو حصص). */
export function prorate(amount: Dinar, usedUnits: number, totalUnits: number): Dinar {
  assertDinars(amount);
  if (amount < 0) throw new RangeError("amount must be >= 0");
  if (!Number.isInteger(usedUnits) || !Number.isInteger(totalUnits) || totalUnits <= 0) {
    throw new RangeError("units must be integers and totalUnits > 0");
  }
  if (usedUnits < 0 || usedUnits > totalUnits) throw new RangeError("usedUnits must be within 0..totalUnits");
  return Math.floor((amount * usedUnits * 2 + totalUnits) / (2 * totalUnits));
}

/** يقسم مبلغاً على أجزاء دون فقدان أي دينار (الباقي يُوزَّع على الأجزاء الأولى). */
export function splitEvenly(total: Dinar, parts: number): Dinar[] {
  assertDinars(total, "total");
  if (total < 0) throw new RangeError("total must be >= 0");
  if (!Number.isInteger(parts) || parts < 1) throw new RangeError("parts must be an integer >= 1");
  const base = Math.floor(total / parts);
  const remainder = total % parts;
  return Array.from({ length: parts }, (_, i) => base + (i < remainder ? 1 : 0));
}

/** مثال: 1500 → "1 500 دج" (فاصل آلاف بمسافة غير منقسمة). */
export function formatDinars(amount: Dinar, locale: "ar" | "fr" = "ar"): string {
  assertDinars(amount);
  const sign = amount < 0 ? "-" : "";
  const digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${sign}${digits}${NBSP}${locale === "ar" ? "دج" : "DA"}`;
}

/**
 * يحلّل نصاً أدخله المستخدم إلى دنانير صحيحة.
 * يقبل: أرقاماً هندية، مسافات كفاصل آلاف، لاحقة دج/DA/DZD، وكسراً صفرياً (1500,00).
 * يرفض (null): كسراً غير صفري، أو فاصلة قد تعني آلافاً أو كسراً (مثل "1,500") لأنها ملتبسة.
 */
export function parseDinars(input: string): Dinar | null {
  let s = toWesternDigits(input).trim();
  s = s.replace(/(دج|دينار|DZD|DA|da)\s*$/u, "").replace(/[\s\u00A0\u202F]/g, "");
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return Number.isSafeInteger(n) ? n : null;
  }
  const m = /^(\d+)[.,]0+$/.exec(s);
  if (m && m[1] !== undefined) {
    const n = Number(m[1]);
    return Number.isSafeInteger(n) ? n : null;
  }
  return null;
}
