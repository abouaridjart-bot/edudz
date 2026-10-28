import { describe, expect, it } from "vitest";
import { checkPayout, type PayoutBlockReason } from "@/lib/payouts";

const BLOCK_MESSAGES: Record<PayoutBlockReason, string> = {
  invalid: "بيانات الصرف غير صالحة",
  "already-issued": "تم إصدار هذا الأجر مسبقاً",
  "already-paid": "تم دفع هذا الأجر مسبقاً",
};

describe("checkPayout", () => {
  it("يقبل إصدار أو دفع أجر بحالة DRAFT", () => {
    expect(checkPayout({ status: "DRAFT" })).toEqual({ ok: true });
  });

  it("يرفض إصدار أجر تم إصداره مسبقاً", () => {
    expect(checkPayout({ status: "ISSUED" })).toEqual({
      ok: false,
      reason: "already-issued",
    });
  });

  it("يرفض دفع أجر لم يُصدَّر بعد", () => {
    expect(checkPayout({ status: "ISSUED" })).toEqual({
      ok: false,
      reason: "already-issued",
    });
  });

  it("يرفض دفع أجر تم دفعه مسبقاً", () => {
    expect(checkPayout({ status: "PAID" })).toEqual({
      ok: false,
      reason: "already-paid",
    });
  });
});