import { describe, expect, it } from "vitest";
import { formatPhoneNational, isValidAlgerianMobile, normalizeAlgerianMobile } from "@/lib/phone";

describe("phone", () => {
  it("يقبل الصيغ الشائعة", () => {
    for (const v of ["0555123456", "0555 12 34 56", "+213 555 12 34 56", "00213555123456", "213555123456", "+213 (0) 555 12 34 56", "٠٥٥٥١٢٣٤٥٦"]) {
      expect(normalizeAlgerianMobile(v)).toBe("+213555123456");
    }
  });

  it("يقبل 6 و7", () => {
    expect(isValidAlgerianMobile("0661234567")).toBe(true);
    expect(isValidAlgerianMobile("0771234567")).toBe(true);
  });

  it("يرفض غير الصالح", () => {
    for (const v of ["0455123456", "055512345", "05551234567", "abc", "", "+33612345678", "0155123456"]) {
      expect(isValidAlgerianMobile(v)).toBe(false);
    }
  });

  it("التنسيق الوطني", () => {
    expect(formatPhoneNational("+213555123456")).toBe("0555 12 34 56");
    expect(formatPhoneNational("غير صالح")).toBe("غير صالح");
  });
});
