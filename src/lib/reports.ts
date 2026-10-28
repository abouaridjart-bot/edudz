/** تقارير مالية — منطق نقي بلا اعتماد على قاعدة البيانات. */

export interface FinancialSummary {
  /** إجمالي المصاريف (دينار). */
  totalExpenses: number;
  /** إجمالي الأجور الصادرة (دينار). */
  totalPayouts: number;
  /** صافي الربح (إجمالي الأجور - إجمالي المصاريف). */
  netProfit: number;
}

export interface StudentStats {
  /** عدد الطلاب النشطين. */
  activeStudents: number;
  /** معدل التخرج (0..1). */
  graduationRate: number;
  /** معدل الحضور (0..1). */
  attendanceRate: number;
}

export interface BranchPerformance {
  /** إجمالي الطلاب النشطين في الفرع. */
  activeStudents: number;
  /** معدل الحضور (0..1). */
  attendanceRate: number;
  /** صافي الربح (دينار). */
  netProfit: number;
}

export interface FinancialSummaryInput {
  /** المصاريف (دينار). */
  expenses: number;
  /** الأجور الصادرة (دينار). */
  payouts: number;
}

export interface StudentStatsInput {
  /** عدد الطلاب النشطين. */
  activeStudents: number;
  /** عدد الطلاب المتخرجين. */
  graduatedStudents: number;
  /** عدد الحصص. */
  totalSessions: number;
  /** عدد الحضور. */
  totalAttendance: number;
}

export interface BranchPerformanceInput {
  /** عدد الطلاب النشطين في الفرع. */
  activeStudents: number;
  /** عدد الحصص في الفرع. */
  totalSessions: number;
  /** عدد الحضور في الفرع. */
  totalAttendance: number;
  /** المصاريف في الفرع (دينار). */
  expenses: number;
  /** الأجور الصادرة في الفرع (دينار). */
  payouts: number;
}

/**
 * يحسب ملخصاً مالياً: إجمالي المصاريف، إجمالي الأجور، وصافي الربح.
 * جميع القيم يجب أن تكون أعداداً صحيحة غير سالبة.
 */
export function computeFinancialSummary(input: FinancialSummaryInput): FinancialSummary {
  if (!Number.isSafeInteger(input.expenses) || input.expenses < 0) throw new Error("expenses must be a non-negative integer");
  if (!Number.isSafeInteger(input.payouts) || input.payouts < 0) throw new Error("payouts must be a non-negative integer");

  return {
    totalExpenses: input.expenses,
    totalPayouts: input.payouts,
    netProfit: input.payouts - input.expenses,
  };
}

/**
 * يحسب إحصائيات الطلاب: عدد الطلاب النشطين، معدل التخرج، ومعدل الحضور.
 * جميع القيم يجب أن تكون أعداداً صحيحة غير سالبة.
 */
export function computeStudentStats(input: StudentStatsInput): StudentStats {
  if (!Number.isSafeInteger(input.activeStudents) || input.activeStudents < 0) throw new Error("activeStudents must be a non-negative integer");
  if (!Number.isSafeInteger(input.graduatedStudents) || input.graduatedStudents < 0) throw new Error("graduatedStudents must be a non-negative integer");
  if (!Number.isSafeInteger(input.totalSessions) || input.totalSessions < 0) throw new Error("totalSessions must be a non-negative integer");
  if (!Number.isSafeInteger(input.totalAttendance) || input.totalAttendance < 0) throw new Error("totalAttendance must be a non-negative integer");

  const graduationRate = input.activeStudents > 0 ? input.graduatedStudents / input.activeStudents : 0;
  const attendanceRate = input.totalSessions > 0 ? input.totalAttendance / input.totalSessions : 0;

  return {
    activeStudents: input.activeStudents,
    graduationRate,
    attendanceRate,
  };
}

/**
 * يحسب أداء الفرع: عدد الطلاب النشطين، معدل الحضور، وصافي الربح.
 * جميع القيم يجب أن تكون أعداداً صحيحة غير سالبة.
 */
export function computeBranchPerformance(input: BranchPerformanceInput): BranchPerformance {
  if (!Number.isSafeInteger(input.activeStudents) || input.activeStudents < 0) throw new Error("activeStudents must be a non-negative integer");
  if (!Number.isSafeInteger(input.totalSessions) || input.totalSessions < 0) throw new Error("totalSessions must be a non-negative integer");
  if (!Number.isSafeInteger(input.totalAttendance) || input.totalAttendance < 0) throw new Error("totalAttendance must be a non-negative integer");
  if (!Number.isSafeInteger(input.expenses) || input.expenses < 0) throw new Error("expenses must be a non-negative integer");
  if (!Number.isSafeInteger(input.payouts) || input.payouts < 0) throw new Error("payouts must be a non-negative integer");

  const attendanceRate = input.totalSessions > 0 ? input.totalAttendance / input.totalSessions : 0;
  const netProfit = input.payouts - input.expenses;

  return {
    activeStudents: input.activeStudents,
    attendanceRate,
    netProfit,
  };
}