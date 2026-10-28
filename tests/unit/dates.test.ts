import { describe, expect, it } from "vitest";
import {
  academicYearLabel, algiersParts, formatDate, formatDateLong, formatDateTime, formatHHMM, formatPeriod, isValidRange,
  monthName, parseHHMM, rangesOverlap, startOfMonthInAlgiers, todayInAlgiers, weekdayName,
} from "@/lib/dates";

describe("dates (Africa/Algiers)", () => {
  it("التوقيت UTC+1", () => {
    const d = new Date("2026-10-27T23:30:00Z");
    expect(formatDateTime(d)).toBe("28/10/2026 00:30");
    expect(algiersParts(d).weekday).toBe(3); // الأربعاء
  });

  it("التنسيق", () => {
    expect(formatDate(new Date("2026-01-05T10:00:00Z"))).toBe("05/01/2026");
    expect(formatDateLong(new Date("2026-10-27T10:00:00Z"))).toBe("27 أكتوبر 2026");
    expect(formatDateLong(new Date("2026-01-05T10:00:00Z"), "ar", "standard")).toBe("5 يناير 2026");
    expect(formatDateLong(new Date("2026-01-05T10:00:00Z"), "fr")).toBe("5 janvier 2026");
  });

  it("أسماء الأشهر والأيام", () => {
    expect(monthName(1)).toBe("جانفي");
    expect(monthName(6, "ar", "dz")).toBe("جوان");
    expect(monthName(2, "ar", "standard")).toBe("فبراير");
    expect(weekdayName(6)).toBe("السبت");
    expect(() => monthName(13)).toThrow();
    expect(() => weekdayName(7)).toThrow();
  });

  it("السنة الدراسية", () => {
    expect(academicYearLabel(new Date("2026-10-27T10:00:00Z"))).toBe("2026/2027");
    expect(academicYearLabel(new Date("2026-06-15T10:00:00Z"))).toBe("2025/2026");
    expect(academicYearLabel(new Date("2026-09-01T10:00:00Z"))).toBe("2026/2027");
  });

  it("HH:mm ↔ دقائق", () => {
    expect(parseHHMM("08:30")).toBe(510);
    expect(parseHHMM("23:59")).toBe(1439);
    expect(parseHHMM("24:00")).toBeNull();
    expect(parseHHMM("8:30")).toBeNull();
    expect(formatHHMM(510)).toBe("08:30");
    expect(() => formatHHMM(1440)).toThrow();
  });

  it("تقاطع الفترات", () => {
    const t = (s: string) => parseHHMM(s) as number;
    expect(rangesOverlap(t("08:00"), t("10:00"), t("09:00"), t("11:00"))).toBe(true);
    expect(rangesOverlap(t("08:00"), t("10:00"), t("10:00"), t("12:00"))).toBe(false); // متلامستان
    expect(rangesOverlap(t("08:00"), t("12:00"), t("09:00"), t("10:00"))).toBe(true); // احتواء
    expect(rangesOverlap(t("08:00"), t("09:00"), t("10:00"), t("11:00"))).toBe(false);
    expect(rangesOverlap(t("09:00"), t("10:00"), t("09:00"), t("10:00"))).toBe(true); // متطابقتان
  });

  it("صلاحية الفترة", () => {
    expect(isValidRange(480, 600)).toBe(true);
    expect(isValidRange(600, 600)).toBe(false);
    expect(isValidRange(700, 600)).toBe(false);
    expect(isValidRange(-1, 600)).toBe(false);
  });

  it("فترة الفاتورة YYYY-MM", () => {
    expect(formatPeriod("2026-10")).toBe("أكتوبر 2026");
    expect(formatPeriod("2026-01")).toBe("جانفي 2026");
    expect(formatPeriod("2026-01", "fr")).toBe("janvier 2026");
    expect(formatPeriod("2026-13")).toBe("2026-13");
    expect(formatPeriod("bad")).toBe("bad");
  });

  it("حدود اليوم والشهر بتوقيت الجزائر (UTC midnight)", () => {
    const p = algiersParts(new Date());
    const today = todayInAlgiers();
    expect(today.toISOString()).toBe(
      `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}T00:00:00.000Z`,
    );
    const monthStart = startOfMonthInAlgiers();
    expect(monthStart.toISOString()).toBe(
      `${p.year}-${String(p.month).padStart(2, "0")}-01T00:00:00.000Z`,
    );
  });
});
