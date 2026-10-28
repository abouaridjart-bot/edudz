import { z } from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getActor } from "@/lib/session";
import { ActionError } from "@/lib/action";
import { requireCenterId, can } from "@/lib/permissions";

const expenseSchema = z.object({
  branchId: z.string().trim().min(1, "اختر الفرع"),
  category: z.string().trim().min(1, "اختر التصنيف"),
  amount: z.coerce.number().int().positive("يجب أن يكون المبلغ أكبر من صفر"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ غير صالح"),
  note: z.string().trim().max(255, "الملاحظة طويلة جداً").optional(),
});

/** تسجيل مصاريف المركز/الفرع. للمالك والمدير فقط. */
export async function createExpense(formData: FormData): Promise<void> {
  const actor = await getActor();
  if (!actor) throw new ActionError("غير مصرح");
  const centerId = requireCenterId(actor);

  const parsed = expenseSchema.safeParse({
    branchId: formData.get("branchId"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    throw new ActionError(first && first.length > 0 ? first : "بيانات غير صالحة");
  }

  const { branchId, category, amount, date, note } = parsed.data;

  // فحص الصلاحية: هل يملك المستخدم حق إنشاء مصاريف في هذا المركز والفرع؟
  if (!can(actor, "create", "expense", { centerId, branchId })) {
    throw new ActionError("غير مصرح لك بتسجيل مصاريف في هذا الفرع");
  }

  await db.expense.create({
    data: {
      centerId,
      branchId,
      category,
      amount,
      date: new Date(date),
      note: note || null,
    },
  });

  revalidatePath("/center/reports"); // التقارير المالية تتأثر بالمصاريف
  redirect("/center/reports?ok=" + encodeURIComponent("تم تسجيل المصروف بنجاح"));
}