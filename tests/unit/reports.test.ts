import { describe, expect, it } from "vitest";
import {
  computeFinancialSummary,
  computeStudentStats,
  computeBranchPerformance,
} from "@/lib/reports";

describe("computeFinancialSummary", () => {
  it("يحسب إجمالي المصاريف، إجمالي الأجور، وصافي الربح", () => {
    const result = computeFinancialSummary({ expenses: 10000, payouts: 15000 });
    expect(result).toEqual({
      totalExpenses: 10000,
      totalPayouts: 15000,
      netProfit: 5000,
    });
  });

  it("يرفض القيم السالبة", () => {
    expect(() => computeFinancialSummary({ expenses: -1, payouts: 1000 })).toThrow("non-negative integer");
    expect(() => computeFinancialSummary({ expenses: 1000, payouts: -1 })).toThrow("non-negative integer");
  });
});

describe("computeStudentStats", () => {
  it("يحسب عدد الطلاب النشطين، معدل التخرج، ومعدل الحضور", () => {
    const result = computeStudentStats({
      activeStudents: 100,
      graduatedStudents: 20,
      totalSessions: 50,
      totalAttendance: 45,
    });
    expect(result).toEqual({
      activeStudents: 100,
      graduationRate: 0.2,
      attendanceRate: 0.9,
    });
  });

  it("يعيد معدل 0 إن لم يكن هناك طلاب نشطين أو حصص", () => {
    const result = computeStudentStats({
      activeStudents: 0,
      graduatedStudents: 0,
      totalSessions: 0,
      totalAttendance: 0,
    });
    expect(result).toEqual({
      activeStudents: 0,
      graduationRate: 0,
      attendanceRate: 0,
    });
  });

  it("يرفض القيم السالبة", () => {
    expect(() => computeStudentStats({ activeStudents: -1, graduatedStudents: 0, totalSessions: 0, totalAttendance: 0 })).toThrow("non-negative integer");
    expect(() => computeStudentStats({ activeStudents: 0, graduatedStudents: -1, totalSessions: 0, totalAttendance: 0 })).toThrow("non-negative integer");
    expect(() => computeStudentStats({ activeStudents: 0, graduatedStudents: 0, totalSessions: -1, totalAttendance: 0 })).toThrow("non-negative integer");
    expect(() => computeStudentStats({ activeStudents: 0, graduatedStudents: 0, totalSessions: 0, totalAttendance: -1 })).toThrow("non-negative integer");
  });
});

describe("computeBranchPerformance", () => {
  it("يحسب عدد الطلاب النشطين، معدل الحضور، وصافي الربح", () => {
    const result = computeBranchPerformance({
      activeStudents: 50,
      totalSessions: 20,
      totalAttendance: 18,
      expenses: 5000,
      payouts: 8000,
    });
    expect(result).toEqual({
      activeStudents: 50,
      attendanceRate: 0.9,
      netProfit: 3000,
    });
  });

  it("يعيد معدل 0 إن لم يكن هناك حصص", () => {
    const result = computeBranchPerformance({
      activeStudents: 50,
      totalSessions: 0,
      totalAttendance: 0,
      expenses: 5000,
      payouts: 8000,
    });
    expect(result).toEqual({
      activeStudents: 50,
      attendanceRate: 0,
      netProfit: 3000,
    });
  });

  it("يرفض القيم السالبة", () => {
    expect(() => computeBranchPerformance({ activeStudents: -1, totalSessions: 0, totalAttendance: 0, expenses: 0, payouts: 0 })).toThrow("non-negative integer");
    expect(() => computeBranchPerformance({ activeStudents: 0, totalSessions: -1, totalAttendance: 0, expenses: 0, payouts: 0 })).toThrow("non-negative integer");
    expect(() => computeBranchPerformance({ activeStudents: 0, totalSessions: 0, totalAttendance: -1, expenses: 0, payouts: 0 })).toThrow("non-negative integer");
    expect(() => computeBranchPerformance({ activeStudents: 0, totalSessions: 0, totalAttendance: 0, expenses: -1, payouts: 0 })).toThrow("non-negative integer");
    expect(() => computeBranchPerformance({ activeStudents: 0, totalSessions: 0, totalAttendance: 0, expenses: 0, payouts: -1 })).toThrow("non-negative integer");
  });
});