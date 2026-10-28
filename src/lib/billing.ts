export interface FeePlanInput {
  type: "MONTHLY" | "PER_SESSION" | "TERM" | "PACKAGE";
  amount: number;
  registrationFee?: number;
}

export interface BillingInput {
  plan: FeePlanInput;
  period: string; // YYYY-MM
  attendanceRatio?: number; // 0-1 for partial
  discountPct?: number;
}

export function computeInvoiceAmount(input: BillingInput): number {
  let base = input.plan.amount;
  if (input.attendanceRatio !== undefined && input.attendanceRatio >= 0 && input.attendanceRatio < 1) {
    base = Math.round(base * input.attendanceRatio);
  }
  const discount = input.discountPct ?? 0;
  if (discount > 0) {
    base = Math.max(0, Math.round(base * (1 - discount / 100)));
  }
  if (input.plan.registrationFee && input.period.endsWith("-09")) {
    base += input.plan.registrationFee;
  }
  return base;
}

export function isValidGrade(g: number): boolean {
  if (g < 0 || g > 20) return false;
  return (Math.round(g * 4) / 4) === g || Math.abs(g * 4 - Math.round(g * 4)) < 1e-9;
}
