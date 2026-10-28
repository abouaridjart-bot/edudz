import { z } from "zod";
import { normalizeAlgerianMobile } from "./phone";

/** يحوّل الحقول الفارغة/غير الموجودة إلى undefined حتى تعمل الحقول الاختيارية. */
const emptyToUndefined = (value: unknown) =>
  value === null || value === undefined || (typeof value === "string" && value.trim() === "") ? undefined : value;

const optionalPhone = z.preprocess(
  emptyToUndefined,
  z
    .string({ invalid_type_error: "رقم الهاتف غير صالح" })
    .trim()
    .superRefine((value, ctx) => {
      if (!normalizeAlgerianMobile(value)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "رقم هاتف جزائري غير صالح (مثال: 0551234567)" });
      }
    })
    .transform((value) => normalizeAlgerianMobile(value) as string)
    .optional(),
);

const optionalBirthDate = z.preprocess(
  emptyToUndefined,
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "تاريخ الميلاد غير صالح")
    .superRefine((value, ctx) => {
      const date = new Date(`${value}T00:00:00.000Z`);
      if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "تاريخ الميلاد غير صالح" });
        return;
      }
      if (date.getTime() >= Date.now()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "تاريخ الميلاد يجب أن يكون في الماضي" });
      }
      if (date.getUTCFullYear() < 1900) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "تاريخ الميلاد غير معقول" });
      }
    })
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .optional(),
);

const optionalText = (max: number, message: string) =>
  z.preprocess(emptyToUndefined, z.string().trim().max(max, message).optional());

/** بريد إلكتروني اختياري (مطلوب لتفعيل دخول الطالب لاحقاً). */
const optionalEmail = z.preprocess(
  emptyToUndefined,
  z
    .string({ invalid_type_error: "بريد إلكتروني غير صالح" })
    .trim()
    .toLowerCase()
    .max(120, "البريد الإلكتروني طويل جداً")
    .email("بريد إلكتروني غير صالح")
    .optional(),
);

/** مدخلات إنشاء طالب جديد — تُستخدم في الخادم والعميل معاً (نقية بلا اعتماد على قاعدة البيانات). */
export const studentCreateSchema = z.object({
  fullName: z
    .string({ required_error: "الاسم الكامل مطلوب", invalid_type_error: "الاسم الكامل مطلوب" })
    .trim()
    .min(3, "الاسم الكامل مطلوب (3 أحرف على الأقل)")
    .max(100, "الاسم الكامل طويل جداً"),
  phone: optionalPhone,
  email: optionalEmail,
  branchId: z.string({ required_error: "الفرع مطلوب" }).min(1, "الفرع مطلوب"),
  levelId: z.string({ required_error: "المستوى الدراسي مطلوب" }).min(1, "المستوى الدراسي مطلوب"),
  streamId: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  birthDate: optionalBirthDate,
  schoolName: optionalText(120, "اسم المدرسة طويل جداً"),
  notes: optionalText(1000, "الملاحظات طويلة جداً"),
});

export type StudentCreateInput = z.infer<typeof studentCreateSchema>;
