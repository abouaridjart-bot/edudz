import { describe, expect, it } from "vitest";
import { studentCreateSchema } from "@/lib/student-input";

const base = { fullName: "أمين بلقاسم", branchId: "b1", levelId: "l1" };

function firstMessage(result: { success: boolean; error?: { issues: { message: string }[] } }): string {
  return result.error?.issues[0]?.message ?? "";
}

describe("studentCreateSchema", () => {
  it("يقبل الحد الأدنى ويحوّل الحقول الفارغة إلى undefined", () => {
    const result = studentCreateSchema.safeParse({
      ...base,
      phone: "",
      streamId: "",
      birthDate: "",
      schoolName: "",
      notes: "",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBeUndefined();
      expect(result.data.streamId).toBeUndefined();
      expect(result.data.birthDate).toBeUndefined();
      expect(result.data.schoolName).toBeUndefined();
      expect(result.data.notes).toBeUndefined();
    }
  });

  it("يطبّع رقم الهاتف الجزائري إلى E.164", () => {
    const result = studentCreateSchema.safeParse({ ...base, phone: "0551 23 45 67" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("+213551234567");
  });

  it("يرفض رقم هاتف غير صالح برسالة عربية", () => {
    const result = studentCreateSchema.safeParse({ ...base, phone: "12345" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toContain("رقم هاتف");
  });

  it("يرفض اسماً قصيراً جداً", () => {
    const result = studentCreateSchema.safeParse({ ...base, fullName: "أم" });
    expect(result.success).toBe(false);
    expect(firstMessage(result)).toContain("الاسم الكامل");
  });

  it("يرفض تاريخ ميلاد غير موجود أو في المستقبل", () => {
    const invalid = studentCreateSchema.safeParse({ ...base, birthDate: "2026-02-31" });
    expect(invalid.success).toBe(false);
    expect(firstMessage(invalid)).toBe("تاريخ الميلاد غير صالح");

    const future = studentCreateSchema.safeParse({ ...base, birthDate: "2999-01-01" });
    expect(future.success).toBe(false);
    expect(firstMessage(future)).toContain("الماضي");

    const tooOld = studentCreateSchema.safeParse({ ...base, birthDate: "1899-01-01" });
    expect(tooOld.success).toBe(false);
    expect(firstMessage(tooOld)).toContain("غير معقول");
  });

  it("يقبل تاريخ ميلاد صحيحاً ويحوّله إلى Date", () => {
    const result = studentCreateSchema.safeParse({ ...base, birthDate: "2010-05-20" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.birthDate).toBeInstanceOf(Date);
      expect(result.data.birthDate?.toISOString().slice(0, 10)).toBe("2010-05-20");
    }
  });
});
