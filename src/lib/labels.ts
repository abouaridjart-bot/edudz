/**
 * ترجمة قيم enums إلى عربية + لون الحالة.
 * تُستخدم في الواجهة فقط؛ لا تصلح لأي فحص صلاحيات أو منطق مالي.
 */

export type Tone = "neutral" | "info" | "success" | "warning" | "danger";

export interface StatusLabel {
  label: string;
  tone: Tone;
}

function pick(map: Record<string, StatusLabel>, value: string): StatusLabel {
  return map[value] ?? { label: value, tone: "neutral" };
}

const INVOICE: Record<string, StatusLabel> = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  ISSUED: { label: "غير مدفوعة", tone: "info" },
  PARTIAL: { label: "مدفوعة جزئياً", tone: "warning" },
  PAID: { label: "مدفوعة", tone: "success" },
  VOID: { label: "ملغاة", tone: "danger" },
};

const SESSION: Record<string, StatusLabel> = {
  PLANNED: { label: "مبرمجة", tone: "info" },
  DONE: { label: "منجزة", tone: "success" },
  CANCELLED: { label: "ملغاة", tone: "danger" },
  MAKEUP: { label: "استدراك", tone: "warning" },
};

const ATTENDANCE: Record<string, StatusLabel> = {
  PRESENT: { label: "حاضر", tone: "success" },
  ABSENT: { label: "غائب", tone: "danger" },
  LATE: { label: "متأخر", tone: "warning" },
  EXCUSED: { label: "بعذر", tone: "neutral" },
};

const PAY_METHOD: Record<string, StatusLabel> = {
  CASH: { label: "نقداً", tone: "neutral" },
  CCP: { label: "CCP", tone: "neutral" },
  BARIDIMOB: { label: "BaridiMob", tone: "neutral" },
  BANK: { label: "تحويل بنكي", tone: "neutral" },
  OTHER: { label: "أخرى", tone: "neutral" },
};

const ENROLLMENT: Record<string, StatusLabel> = {
  ACTIVE: { label: "نشط", tone: "success" },
  WAITLIST: { label: "قائمة انتظار", tone: "warning" },
  LEFT: { label: "منسحب", tone: "neutral" },
};

const GROUP: Record<string, StatusLabel> = {
  ACTIVE: { label: "نشط", tone: "success" },
  PAUSED: { label: "متوقف مؤقتاً", tone: "warning" },
  CLOSED: { label: "مغلق", tone: "neutral" },
};

const PUBLISH: Record<string, StatusLabel> = {
  DRAFT: { label: "مسودة", tone: "neutral" },
  REVIEW: { label: "قيد المراجعة", tone: "warning" },
  PUBLISHED: { label: "منشور", tone: "success" },
};

const VISIBILITY: Record<string, StatusLabel> = {
  PUBLIC: { label: "عام", tone: "info" },
  CENTER: { label: "المركز", tone: "neutral" },
  GROUP: { label: "الفوج", tone: "neutral" },
};

const CYCLE: Record<string, string> = {
  PRIMARY: "الابتدائي",
  MIDDLE: "المتوسط",
  SECONDARY: "الثانوي",
};

const ROLE: Record<string, string> = {
  SUPER_ADMIN: "مشرف عام",
  CENTER_OWNER: "مالك المركز",
  BRANCH_MANAGER: "مدير فرع",
  SECRETARY: "سكرتير",
  TEACHER: "أستاذ",
  STUDENT: "طالب",
  PARENT: "ولي",
};

export const invoiceStatus = (v: string) => pick(INVOICE, v);
export const sessionStatus = (v: string) => pick(SESSION, v);
export const attendanceStatus = (v: string) => pick(ATTENDANCE, v);
export const payMethod = (v: string) => pick(PAY_METHOD, v);
export const enrollmentStatus = (v: string) => pick(ENROLLMENT, v);
export const groupStatus = (v: string) => pick(GROUP, v);
export const publishStatus = (v: string) => pick(PUBLISH, v);
export const visibilityLabel = (v: string) => pick(VISIBILITY, v);

export function roleLabel(role: string | null | undefined): string {
  return role ? (ROLE[role] ?? role) : "—";
}

export function cycleLabel(cycle: string): string {
  return CYCLE[cycle] ?? cycle;
}
