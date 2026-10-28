import { describe, expect, it } from "vitest";
import { answersMatch, matchesQuery, normalizeArabic, tokenize } from "@/lib/arabic";
import { toWesternDigits } from "@/lib/digits";

describe("arabic", () => {
  it("يحوّل الأرقام الهندية والفارسية", () => {
    expect(toWesternDigits("٢٠٢٦")).toBe("2026");
    expect(toWesternDigits("۱۲۳abc")).toBe("123abc");
  });

  it("يزيل التشكيل", () => {
    expect(normalizeArabic("الْمَدْرَسَةُ")).toBe("المدرسه");
    expect(normalizeArabic("الرِّيَاضِيَّات")).toBe("الرياضيات");
  });

  it("يوحّد الألف والياء والتاء المربوطة", () => {
    expect(normalizeArabic("إِنْشَاء")).toBe("انشاء");
    expect(normalizeArabic("أحمد آل")).toBe("احمد ال");
    expect(normalizeArabic("على")).toBe(normalizeArabic("علي"));
    expect(normalizeArabic("مكتبة")).toBe("مكتبه");
  });

  it("يزيل التطويل ويوحّد المسافات", () => {
    expect(normalizeArabic("الـــدرس   الأول")).toBe("الدرس الاول");
  });

  it("التقطيع", () => {
    expect(tokenize("الدرس الأوّل: المعادلات، والمتراجحات")).toEqual(["الدرس", "الاول", "المعادلات", "والمتراجحات"]);
  });

  it("المطابقة في البحث", () => {
    expect(matchesQuery("الدرس الأول: المعادلات من الدرجة الثانية", "معادلات")).toBe(true);
    expect(matchesQuery("الدرس الأول: المعادلات من الدرجة الثانية", "المعادلات الثانيه")).toBe(true);
    expect(matchesQuery("الدرس الأول", "الفيزياء")).toBe(false);
    expect(matchesQuery("الدرس الأول", "   ")).toBe(false);
  });

  it("الإجابة القصيرة", () => {
    expect(answersMatch("  الجَزَائِر ", ["الجزائر"])).toBe(true);
    expect(answersMatch("وهران", ["الجزائر", "قسنطينة"])).toBe(false);
    expect(answersMatch("", [""])).toBe(false);
  });
});
