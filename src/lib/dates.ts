/** التواريخ والأوقات بتوقيت الجزائر (Africa/Algiers، UTC+1 دون توقيت صيفي). */
export const TIME_ZONE = "Africa/Algiers";

/** 0 = الأحد … 6 = السبت (نفس ترقيم JavaScript). الأسبوع الدراسي الافتراضي: الأحد–الخميس. */
export const DEFAULT_SCHOOL_WEEK = [0, 1, 2, 3, 4] as const;

const WEEKDAY_INDEX: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

const partsFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
  weekday: "short",
});

export interface AlgiersParts {
  year: number;
  month: number; // 1..12
  day: number;
  hour: number;
  minute: number;
  weekday: number; // 0..6
}

export function algiersParts(date: Date): AlgiersParts {
  const map: Record<string, string> = {};
  for (const p of partsFormatter.formatToParts(date)) map[p.type] = p.value;
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    weekday: WEEKDAY_INDEX[map.weekday ?? ""] ?? 0,
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

/** DD/MM/YYYY */
export function formatDate(date: Date): string {
  const p = algiersParts(date);
  return `${pad(p.day)}/${pad(p.month)}/${p.year}`;
}

/** HH:mm */
export function formatTime(date: Date): string {
  const p = algiersParts(date);
  return `${pad(p.hour)}:${pad(p.minute)}`;
}

export function formatDateTime(date: Date): string {
  return `${formatDate(date)} ${formatTime(date)}`;
}

export const MONTHS_AR_DZ = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"] as const;
export const MONTHS_AR_STANDARD = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"] as const;
export const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"] as const;
export const WEEKDAYS_AR = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"] as const;
export const WEEKDAYS_FR = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"] as const;

export type MonthStyle = "dz" | "standard";

export function monthName(month: number, locale: "ar" | "fr" = "ar", style: MonthStyle = "dz"): string {
  if (!Number.isInteger(month) || month < 1 || month > 12) throw new RangeError("month must be 1..12");
  const list = locale === "fr" ? MONTHS_FR : style === "dz" ? MONTHS_AR_DZ : MONTHS_AR_STANDARD;
  return list[month - 1] as string;
}

export function weekdayName(weekday: number, locale: "ar" | "fr" = "ar"): string {
  if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6) throw new RangeError("weekday must be 0..6");
  return (locale === "fr" ? WEEKDAYS_FR : WEEKDAYS_AR)[weekday] as string;
}

/** "27 أكتوبر 2026" */
export function formatDateLong(date: Date, locale: "ar" | "fr" = "ar", style: MonthStyle = "dz"): string {
  const p = algiersParts(date);
  return `${p.day} ${monthName(p.month, locale, style)} ${p.year}`;
}

/** السنة الدراسية تبدأ في سبتمبر افتراضياً: أكتوبر 2026 → "2026/2027". */
export function academicYearLabel(date: Date, startMonth = 9): string {
  const { year, month } = algiersParts(date);
  return month >= startMonth ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// ---------- الأوقات داخل اليوم (HH:mm ↔ دقائق) ----------
export function parseHHMM(value: string): number | null {
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

export function formatHHMM(minutes: number): string {
  if (!Number.isInteger(minutes) || minutes < 0 || minutes >= 24 * 60) throw new RangeError("minutes must be 0..1439");
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
}

/** تقاطع فترتين [start, end) — الفترتان المتلامستان (تنتهي إحداهما لحظة بدء الأخرى) لا تتعارضان. */
export function rangesOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/** فترة صالحة: البداية قبل النهاية داخل اليوم نفسه (عبور منتصف الليل ممنوع). */
export function isValidRange(start: number, end: number): boolean {
  return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end <= 24 * 60 && start < end;
}
