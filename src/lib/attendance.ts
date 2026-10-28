/** إدخال الحضور لكل حصة — منطق نقي يُستخدم في الخادم وفي النماذج. */

export type AttendanceStatusLike = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AttendanceBlockReason = "invalid" | "session-not-done" | "already-marked";

export type AttendanceCheck = { ok: true } | { ok: false; reason: AttendanceBlockReason };

export interface AttendanceCheckInput {
  /** حالة الحصة (يجب أن تكون DONE). */
  sessionStatus: string;
  /** هل تم تسجيل الحضور مسبقاً للطالب في هذه الحصة؟ */
  alreadyMarked: boolean;
}

/**
 * يقرر هل يمكن تسجيل حضور/غياب/تأخر. لا يسمح بتسجيل الحضور إلا للحصص المنجزة،
 * ولا يسمح بتسجيل مرتين لنفس الطالب في نفس الحصة.
 */
export function checkAttendance(input: AttendanceCheckInput): AttendanceCheck {
  if (input.sessionStatus !== "DONE") return { ok: false, reason: "session-not-done" };
  if (input.alreadyMarked) return { ok: false, reason: "already-marked" };
  return { ok: true };
}