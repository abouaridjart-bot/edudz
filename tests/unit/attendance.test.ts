import { describe, expect, it } from "vitest";
import { checkAttendance, type AttendanceBlockReason } from "@/lib/attendance";

const BLOCK_MESSAGES: Record<AttendanceBlockReason, string> = {
  invalid: "بيانات الحصة غير صالحة",
  "session-not-done": "لا يمكن تسجيل الحضور إلا بعد إنجاز الحصة",
  "already-marked": "تم تسجيل حضور الطالب مسبقاً في هذه الحصة",
};

describe("checkAttendance", () => {
  it("يقبل الحضور لجلسة منجزة ولم يتم تسجيله بعد", () => {
    expect(checkAttendance({ sessionStatus: "DONE", alreadyMarked: false })).toEqual({ ok: true });
  });

  it("يرفض تسجيل حضور لجلسة غير منجزة", () => {
    expect(checkAttendance({ sessionStatus: "PLANNED", alreadyMarked: false })).toEqual({
      ok: false,
      reason: "session-not-done",
    });
    expect(checkAttendance({ sessionStatus: "CANCELLED", alreadyMarked: false })).toEqual({
      ok: false,
      reason: "session-not-done",
    });
  });

  it("يرفض تسجيل حضور مكرر لنفس الطالب في نفس الجلسة", () => {
    expect(checkAttendance({ sessionStatus: "DONE", alreadyMarked: true })).toEqual({
      ok: false,
      reason: "already-marked",
    });
  });

  it("يرفض حالة غير معروفة للجلسة", () => {
    expect(checkAttendance({ sessionStatus: "UNKNOWN", alreadyMarked: false })).toEqual({
      ok: false,
      reason: "session-not-done",
    });
  });
});