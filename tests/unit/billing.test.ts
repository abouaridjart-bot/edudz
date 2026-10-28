import { describe, expect, it } from "vitest";
import { applyPaymentToInvoice, computeInvoiceAmount, isValidGrade } from "@/lib/billing";

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

describe("تطبيق دفعة على فاتورة", () => {
  it("دفعة جزئية تجعل الحالة PARTIAL", () => {
    expect(applyPaymentToInvoice({ total: 3500, paid: 0 }, 1000)).toEqual({ paid: 1000, status: "PARTIAL" });
    expect(applyPaymentToInvoice({ total: 3500, paid: 1000 }, 500)).toEqual({ paid: 1500, status: "PARTIAL" });
  });

  it("سداد كامل (أو المتبقي بالضبط) يجعل الحالة PAID", () => {
    expect(applyPaymentToInvoice({ total: 3500, paid: 0 }, 3500)).toEqual({ paid: 3500, status: "PAID" });
    expect(applyPaymentToInvoice({ total: 3500, paid: 3000 }, 500)).toEqual({ paid: 3500, status: "PAID" });
  });

  it("يرفض المبالغ غير الصحيحة أو التي تتجاوز المتبقي", () => {
    expect(() => applyPaymentToInvoice({ total: 3500, paid: 0 }, 0)).toThrow(RangeError);
    expect(() => applyPaymentToInvoice({ total: 3500, paid: 0 }, -100)).toThrow(RangeError);
    expect(() => applyPaymentToInvoice({ total: 3500, paid: 0 }, 12.5)).toThrow(RangeError);
    expect(() => applyPaymentToInvoice({ total: 3500, paid: 1000 }, 2501)).toThrow(RangeError);
    expect(() => applyPaymentToInvoice({ total: 3500, paid: 4000 }, 100)).toThrow(RangeError);
  });
});
