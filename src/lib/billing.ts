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

export interface PaymentApplication {
  paid: number;
  status: "PARTIAL" | "PAID";
}

/**
 * يحسب حالة الفاتورة بعد دفعة. كل المبالغ أعداد صحيحة بالدينار.
 * يرمي RangeError عند مبلغ غير صالح أو يتجاوز المتبقي (لا سماح بالدفع الزائد).
 */
export function applyPaymentToInvoice(invoice: { total: number; paid: number }, amount: number): PaymentApplication {
  if (!Number.isSafeInteger(invoice.total) || !Number.isSafeInteger(invoice.paid)) {
    throw new RangeError("invoice amounts must be safe integers");
  }
  if (invoice.total < 0 || invoice.paid < 0) throw new RangeError("invoice amounts must be >= 0");
  if (invoice.paid > invoice.total) throw new RangeError("paid exceeds total");
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new RangeError("amount must be a positive integer of dinars");
  if (amount > invoice.total - invoice.paid) throw new RangeError("amount exceeds remaining balance");
  const paid = invoice.paid + amount;
  return { paid, status: paid >= invoice.total ? "PAID" : "PARTIAL" };
}
