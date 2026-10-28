import { describe, expect, it } from "vitest";
import { LEVELS, STREAMS, SUBJECTS, WILAYAS } from "../../prisma/seed/data";

describe("seed data", () => {
  it("58 ولاية بمعرّفات متسلسلة وأسماء فريدة", () => {
    expect(WILAYAS).toHaveLength(58);
    expect(WILAYAS.map((w) => w.id)).toEqual(Array.from({ length: 58 }, (_, i) => i + 1));
    expect(new Set(WILAYAS.map((w) => w.nameAr)).size).toBe(58);
    expect(new Set(WILAYAS.map((w) => w.nameFr)).size).toBe(58);
  });

  it("12 مستوى: 5 ابتدائي و4 متوسط و3 ثانوي", () => {
    expect(LEVELS).toHaveLength(12);
    expect(LEVELS.filter((l) => l.cycle === "PRIMARY")).toHaveLength(5);
    expect(LEVELS.filter((l) => l.cycle === "MIDDLE")).toHaveLength(4);
    expect(LEVELS.filter((l) => l.cycle === "SECONDARY")).toHaveLength(3);
    expect(new Set(LEVELS.map((l) => l.code)).size).toBe(12);
    expect(LEVELS.map((l) => l.order)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  it("الشعب تشير لمستويات ثانوية موجودة وبرموز فريدة داخل المستوى", () => {
    const secondary = new Set(LEVELS.filter((l) => l.cycle === "SECONDARY").map((l) => l.code));
    const keys = new Set<string>();
    for (const s of STREAMS) {
      expect(secondary.has(s.levelCode)).toBe(true);
      keys.add(`${s.levelCode}:${s.code}`);
    }
    expect(keys.size).toBe(STREAMS.length);
    expect(STREAMS.filter((s) => s.levelCode === "1AS")).toHaveLength(2);
    expect(STREAMS.filter((s) => s.levelCode === "3AS")).toHaveLength(9);
  });

  it("المواد برموز فريدة وأسماء غير فارغة", () => {
    expect(new Set(SUBJECTS.map((s) => s.code)).size).toBe(SUBJECTS.length);
    for (const s of SUBJECTS) {
      expect(s.nameAr.length).toBeGreaterThan(0);
      expect(s.nameFr.length).toBeGreaterThan(0);
    }
  });

  it("لا معاملات ولا أحجام ساعية في البيانات التمهيدية", () => {
    const json = JSON.stringify([LEVELS, STREAMS, SUBJECTS]);
    expect(json.includes("coefficient")).toBe(false);
    expect(json.includes("weeklyHours")).toBe(false);
  });
});
