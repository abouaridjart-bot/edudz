"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { ActionError, withAction } from "@/lib/action";
import { applyPaymentToInvoice } from "@/lib/billing";
import { db } from "@/lib/db";
import { parseDinars } from "@/lib/money";
import { nextReceiptNo } from "@/lib/receipts";

const PAYMENT_METHODS = ["CASH", "CCP", "BARIDIMOB", "BANK", "OTHER"] as const;

const paymentSchema = z.object({
  invoiceId: z.string().min(1, "الفاتورة مطلوبة"),
  amount: z
    .string()
    .min(1, "المبلغ مطلوب")
    .transform((value, ctx) => {
      const parsed = parseDinars(value);
      if (parsed === null || parsed <= 0) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "أدخل مبلغاً صحيحاً بالدينار" });
        return z.NEVER;
      }
      return parsed;
    }),
  method: z.enum(PAYMENT_METHODS, { errorMap: () => ({ message: "طريقة دفع غير صالحة" }) }),
});

type PaymentInput = z.infer<typeof paymentSchema>;

async function getInvoiceTarget(input: PaymentInput) {
  const invoice = await db.invoice.findUnique({
    where: { id: input.invoiceId },
    select: {
      centerId: true,
      enrollment: { select: { student: { select: { branchId: true } } } },
    },
  });
  if (!invoice) return {};
  return { centerId: invoice.centerId, branchId: invoice.enrollment.student.branchId };
}

export async function recordPayment(formData: FormData): Promise<void> {
  const result = await withAction<unknown, PaymentInput, { paymentId: string; receiptNo: string }>({
    input: {
      invoiceId: formData.get("invoiceId"),
      amount: formData.get("amount"),
      method: formData.get("method"),
    },
    schema: paymentSchema,
    resource: "payment",
    action: "create",
    getTarget: getInvoiceTarget,
    audit: {
      entity: "Payment",
      getEntityId: (_input, data) => data.paymentId,
      getMeta: (input, data) => ({
        invoiceId: input.invoiceId,
        amount: input.amount,
        method: input.method,
        receiptNo: data.receiptNo,
      }),
    },
    execute: async (input, actor) => {
      const invoice = await db.invoice.findUnique({
        where: { id: input.invoiceId },
        select: {
          id: true,
          centerId: true,
          total: true,
          paid: true,
          status: true,
          enrollment: { select: { student: { select: { branchId: true } } } },
        },
      });
      if (!invoice) throw new ActionError("الفاتورة غير موجودة");
      if (invoice.centerId !== actor.centerId) throw new ActionError("غير مصرح");
      if (invoice.status === "PAID") throw new ActionError("الفاتورة مدفوعة بالكامل");
      if (invoice.status === "VOID") throw new ActionError("الفاتورة ملغاة");
      if (invoice.status === "DRAFT") throw new ActionError("الفاتورة غير صادرة بعد");

      let application: ReturnType<typeof applyPaymentToInvoice>;
      try {
        application = applyPaymentToInvoice(invoice, input.amount);
      } catch {
        const remaining = invoice.total - invoice.paid;
        throw new ActionError(`المبلغ يتجاوز المتبقي (${remaining} دج)`);
      }

      const branchId = invoice.enrollment.student.branchId;
      const year = new Date().getFullYear();
      const prefix = `RC-${String(year).slice(-2)}-`;

      try {
        const payment = await db.$transaction(async (tx) => {
          const last = await tx.payment.findFirst({
            where: { branchId, receiptNo: { startsWith: prefix } },
            orderBy: { receiptNo: "desc" },
            select: { receiptNo: true },
          });
          const receiptNo = nextReceiptNo(last?.receiptNo ?? null, year);
          const created = await tx.payment.create({
            data: {
              centerId: invoice.centerId,
              branchId,
              invoiceId: invoice.id,
              amount: input.amount,
              method: input.method,
              receiptNo,
              receivedBy: actor.id,
            },
          });
          await tx.invoice.update({
            where: { id: invoice.id },
            data: { paid: application.paid, status: application.status },
          });
          return created;
        });
        return { paymentId: payment.id, receiptNo: payment.receiptNo };
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
          throw new ActionError("تعارض في رقم الإيصال، أعد المحاولة");
        }
        throw err;
      }
    },
  });

  if (!result.ok) {
    redirect(`/center/payments?error=${encodeURIComponent(result.error)}`);
  }

  revalidatePath("/center/payments");
  revalidatePath("/center/invoices");
  redirect(`/center/payments?ok=${encodeURIComponent(result.data.receiptNo)}`);
}
