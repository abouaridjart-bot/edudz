"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { ActionError, withAction } from "@/lib/action";
import { db } from "@/lib/db";
import { computeInvoiceAmount } from "@/lib/billing";
import { periodBounds } from "@/lib/dates";
import { requireCenterId } from "@/lib/permissions";
import { setFlash } from "@/lib/flash";

const schema = z.object({
  period: z.string().trim().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "اختر شهراً صالحاً"),
  branchId: z.string().trim().min(1, "اختر الفرع"),
});

type GenerateInput = z.infer<typeof schema>;

export async function generateInvoices(formData: FormData): Promise<void> {
  const result = await withAction<unknown, GenerateInput, { created: number; skipped: number }>({
    input: { period: formData.get("period"), branchId: formData.get("branchId") },
    schema,
    resource: "invoice",
    action: "create",
    getTarget: async (input) => {
      const branch = await db.branch.findUnique({
        where: { id: input.branchId },
        select: { centerId: true },
      });
      return branch ? { centerId: branch.centerId, branchId: input.branchId } : {};
    },
    audit: {
      entity: "InvoiceBatch",
      getMeta: (input, data) => ({
        period: input.period,
        branchId: input.branchId,
        created: data.created,
        skipped: data.skipped,
      }),
    },
    execute: async (input, actor) => {
      const centerId = requireCenterId(actor);
      const bounds = periodBounds(input.period);
      if (!bounds) throw new ActionError("الشهر غير صالح");

      const branch = await db.branch.findFirst({
        where: { id: input.branchId, centerId },
        select: { id: true },
      });
      if (!branch) throw new ActionError("الفرع غير موجود");

      const enrollments = await db.enrollment.findMany({
        where: {
          centerId,
          status: "ACTIVE",
          startDate: { lte: bounds.end },
          group: { branchId: branch.id, status: { not: "CLOSED" } },
        },
        select: {
          id: true,
          discountPct: true,
          group: { select: { feePlan: { select: { type: true, amount: true, registrationFee: true } } } },
        },
      });

      if (enrollments.length === 0) {
        throw new ActionError("لا توجد تسجيلات نشطة في هذا الفرع لهذا الشهر");
      }

      const year = Number(input.period.slice(0, 4));
      const month = Number(input.period.slice(5, 7));
      // استحقاق افتراضي: 10 من شهر الفاتورة (قابل للتغيير لاحقاً عبر إعدادات المركز).
      const dueDate = new Date(Date.UTC(year, month - 1, 10));

      const rows = enrollments.map((e) => ({
        centerId,
        enrollmentId: e.id,
        period: input.period,
        total: computeInvoiceAmount({
          plan: {
            type: e.group.feePlan.type,
            amount: e.group.feePlan.amount,
            registrationFee: e.group.feePlan.registrationFee,
          },
          period: input.period,
          discountPct: e.discountPct,
        }),
        status: "ISSUED" as const,
        dueDate,
      }));

      const created = await db.invoice.createMany({ data: rows, skipDuplicates: true });
      return { created: created.count, skipped: rows.length - created.count };
    },
  });

  if (!result.ok) {
    setFlash("error", result.error ?? "حدث خطأ غير معروف");
    redirect("/center/invoices");
  }

  revalidatePath("/center/invoices");
  const { created, skipped } = result.data;
  const message =
    created > 0
      ? `تم إنشاء ${created} فاتورة${skipped > 0 ? ` وتخطي ${skipped} فاتورة موجودة مسبقاً` : ""}`
      : `كل فواتير هذا الشهر موجودة مسبقاً (${skipped})`;
  setFlash("success", message);
  revalidatePath("/center/invoices");
  redirect("/center/invoices");
}