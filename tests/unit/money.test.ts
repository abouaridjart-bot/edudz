import { describe, expect, it } from "vitest";
import { addDinars, applyDiscount, assertDinars, formatDinars, parseDinars, percentOf, prorate, splitEvenly } from "@/lib/money";

describe("money", () => {
  it("يرفض الكسور وغير الأعداد", () => {
    expect(() => assertDinars(10.5)).toThrow();
    expect(() => assertDinars(Number.NaN)).toThrow();
    expect(() => assertDinars("100")).toThrow();
    expect(() => assertDinars(1500)).not.toThrow();
  });

  it("الجمع بأعداد صحيحة", () => {
    expect(addDinars(1000, 500, 250)).toBe(1750);
    expect(() => addDinars(1000, 0.1)).toThrow();
  });

  it("النسبة المئوية بتقريب نصف لأعلى", () => {
    expect(percentOf(1000, 12.5)).toBe(125);
    expect(percentOf(333, 50)).toBe(167);
    expect(percentOf(1500, 0)).toBe(0);
    expect(percentOf(1500, 100)).toBe(1500);
    expect(() => percentOf(1500, 101)).toThrow();
    expect(() => percentOf(-1, 10)).toThrow();
  });

  it("الخصم", () => {
    expect(applyDiscount(3000, 10)).toBe(2700);
    expect(applyDiscount(1500, 50)).toBe(750);
  });

  it("التناسب الجزئي", () => {
    expect(prorate(1500, 10, 30)).toBe(500);
    expect(prorate(1000, 1, 3)).toBe(333);
    expect(prorate(1000, 2, 3)).toBe(667);
    expect(prorate(1000, 0, 30)).toBe(0);
    expect(prorate(1000, 30, 30)).toBe(1000);
    expect(() => prorate(1000, 31, 30)).toThrow();
    expect(() => prorate(1000, 1, 0)).toThrow();
  });

  it("التقسيم لا يفقد أي دينار", () => {
    expect(splitEvenly(1000, 3)).toEqual([334, 333, 333]);
    expect(splitEvenly(10, 5)).toEqual([2, 2, 2, 2, 2]);
    for (const [total, parts] of [[0, 3], [1, 7], [9999, 13], [100000, 6]] as const) {
      expect(splitEvenly(total, parts).reduce((a, b) => a + b, 0)).toBe(total);
    }
  });

  it("التنسيق", () => {
    expect(formatDinars(1500)).toBe("1\u00A0500\u00A0دج");
    expect(formatDinars(0)).toBe("0\u00A0دج");
    expect(formatDinars(1234567, "fr")).toBe("1\u00A0234\u00A0567\u00A0DA");
    expect(formatDinars(-2500)).toBe("-2\u00A0500\u00A0دج");
  });

  it("التحليل", () => {
    expect(parseDinars("1500")).toBe(1500);
    expect(parseDinars("1 500 دج")).toBe(1500);
    expect(parseDinars("١٥٠٠")).toBe(1500);
    expect(parseDinars("1500,00")).toBe(1500);
    expect(parseDinars("1500.00 DA")).toBe(1500);
    expect(parseDinars("1500,50")).toBeNull();
    expect(parseDinars("1,500")).toBeNull();
    expect(parseDinars("abc")).toBeNull();
    expect(parseDinars("")).toBeNull();
  });
});
