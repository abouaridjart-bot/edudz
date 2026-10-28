import { describe, expect, it } from "vitest";
import { newPasswordProblem, passwordProblem } from "@/lib/password-policy";

describe("passwordProblem", () => {
  it("يقبل كلمة مرور بطول كافٍ مع حرف ورقم", () => {
    expect(passwordProblem("Demo12345")).toBeNull();
    expect(passwordProblem("كلمةمرور1")).toBeNull();
  });

  it("يرفض القصيرة والطويلة", () => {
    expect(passwordProblem("Ab1")).toContain("8");
    expect(passwordProblem("a".repeat(129) + "1")).toContain("طويلة");
  });

  it("يرفض ما بلا حرف أو بلا رقم", () => {
    expect(passwordProblem("12345678")).toContain("حرف");
    expect(passwordProblem("abcdefgh")).toContain("رقم");
  });
});

describe("newPasswordProblem", () => {
  it("يرفض عدم التطابق", () => {
    expect(newPasswordProblem("Demo12345", "Demo12346")).toBe("كلمتا المرور غير متطابقتين");
  });

  it("يعيد مشكلة السياسة قبل مشكلة التطابق", () => {
    expect(newPasswordProblem("short", "other")).toContain("8");
  });

  it("يقبل التطابق الصحيح", () => {
    expect(newPasswordProblem("Demo12345", "Demo12345")).toBeNull();
  });
});
