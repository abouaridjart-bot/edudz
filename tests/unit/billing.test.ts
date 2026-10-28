import { describe, expect, it } from "vitest";
import { computeInvoiceAmount, isValidGrade } from "@/lib/billing";

describe("billing", () => {
  it("يحسب المبلغ الأساسي", () => {
    expect(computeInvoiceAmount({ plan: { type: "MONTHLY", amount: 3000 }, period: "2026-10" })).toBe(3000);
  });

  it("يطبق التناسب الجزئي", () => {
    expect(computeInvoiceAmount({ plan: { type: "MONTHLY", amount: 3000 }, period: "2026-10", attendanceRatio: 0.5 })).toBe(1500);
  });

  it("يطبق الخصم", () => {
    expect(computeInvoiceAmount({ plan: { type: "MONTHLY", amount: 3000 }, period: "2026-10", discountPct: 10 })).toBe(2700);
  });

  it("يتحقق من صحة العلامة بنصف نقطة", () => {
    expect(isValidGrade(15.5)).toBe(true);
    expect(isValidGrade(15.25)).toBe(true);
    expect(isValidGrade(15.1)).toBe(false);
    expect(isValidGrade(21)).toBe(false);
  });
});
