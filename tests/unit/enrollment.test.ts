import { describe, expect, it } from "vitest";
import { checkEnrollment, remainingSeats, type EnrollmentCheckInput } from "@/lib/enrollment";

const base: EnrollmentCheckInput = {
  capacity: 20,
  activeCount: 5,
  alreadyActive: false,
  groupStatus: "ACTIVE",
};

describe("checkEnrollment", () => {
  it("يسمح بالتسجيل عند وجود مقعد وعدم التكرار", () => {
    expect(checkEnrollment(base)).toEqual({ ok: true });
  });

  it("يرفض الفوج الممتلئ", () => {
    expect(checkEnrollment({ ...base, activeCount: 20 })).toEqual({ ok: false, reason: "full" });
    expect(checkEnrollment({ ...base, activeCount: 21 })).toEqual({ ok: false, reason: "full" });
  });

  it("يرفض الرفض الفوج بسعة صفر", () => {
    expect(checkEnrollment({ ...base, capacity: 0, activeCount: 0 })).toEqual({ ok: false, reason: "full" });
  });

  it("يرفض تكرار التسجيل النشط لنفس الطالب", () => {
    expect(checkEnrollment({ ...base, alreadyActive: true })).toEqual({ ok: false, reason: "already-enrolled" });
  });

  it("يرفض الأفواج الموقوفة أو المغلقة", () => {
    expect(checkEnrollment({ ...base, groupStatus: "PAUSED" })).toEqual({ ok: false, reason: "group-not-active" });
    expect(checkEnrollment({ ...base, groupStatus: "CLOSED" })).toEqual({ ok: false, reason: "group-not-active" });
  });

  it("يرفض أعداداً غير صحيحة أو سالبة", () => {
    expect(checkEnrollment({ ...base, capacity: -1 })).toEqual({ ok: false, reason: "invalid" });
    expect(checkEnrollment({ ...base, activeCount: 1.5 })).toEqual({ ok: false, reason: "invalid" });
    expect(checkEnrollment({ ...base, capacity: Number.NaN })).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("remainingSeats", () => {
  it("يحسب المقاعد المتبقية دون سالب", () => {
    expect(remainingSeats(20, 5)).toBe(15);
    expect(remainingSeats(20, 20)).toBe(0);
    expect(remainingSeats(20, 25)).toBe(0);
    expect(remainingSeats(20, -3)).toBe(20);
  });
});
