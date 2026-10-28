import { describe, expect, it } from "vitest";
import { formatGrade, isValidGrade, roundToQuarter, scaleTo20, weightedAverage } from "@/lib/grades";

describe("grades", () => {
  it("الصلاحية بخطوة 0.25", () => {
    expect(isValidGrade(14.25)).toBe(true);
    expect(isValidGrade(0)).toBe(true);
    expect(isValidGrade(20)).toBe(true);
    expect(isValidGrade(14.3)).toBe(false);
    expect(isValidGrade(20.25)).toBe(false);
    expect(isValidGrade(-1)).toBe(false);
  });

  it("التقريب إلى ربع", () => {
    expect(roundToQuarter(14.1)).toBe(14);
    expect(roundToQuarter(14.13)).toBe(14.25);
    expect(roundToQuarter(25)).toBe(20);
    expect(roundToQuarter(-3)).toBe(0);
  });

  it("العرض بفاصلة", () => {
    expect(formatGrade(14.25)).toBe("14,25");
    expect(formatGrade(14)).toBe("14");
  });

  it("التحويل إلى /20", () => {
    expect(scaleTo20(7, 10)).toBe(14);
    expect(scaleTo20(1, 3)).toBe(6.67);
    expect(() => scaleTo20(11, 10)).toThrow();
    expect(() => scaleTo20(1, 0)).toThrow();
  });

  it("المعدل بالمعاملات ويستبعد المجهول", () => {
    expect(weightedAverage([{ grade: 16, coefficient: 4 }, { grade: 10, coefficient: 2 }])).toBe(14);
    expect(weightedAverage([{ grade: 16, coefficient: null }, { grade: 10, coefficient: 2 }])).toBe(10);
    expect(weightedAverage([{ grade: null, coefficient: 3 }])).toBeNull();
    expect(weightedAverage([])).toBeNull();
  });
});
