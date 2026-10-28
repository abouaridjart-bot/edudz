import { describe, expect, it } from "vitest";
import { MATRIX, RESOURCES, ROLES, TenantError, can, canRole, requireCenterId, scopeWhere, type Actor } from "@/lib/permissions";

const owner: Actor = { id: "u-owner", role: "CENTER_OWNER", centerId: "c1" };
const manager: Actor = { id: "u-mgr", role: "BRANCH_MANAGER", centerId: "c1", branchIds: ["b1"] };
const secretary: Actor = { id: "u-sec", role: "SECRETARY", centerId: "c1", branchIds: ["b1"] };
const teacher: Actor = { id: "u-t1", role: "TEACHER", centerId: "c1" };
const student: Actor = { id: "u-s1", role: "STUDENT", centerId: "c1" };
const parent: Actor = { id: "u-p1", role: "PARENT", centerId: "c1", childStudentIds: ["s1"] };
const admin: Actor = { id: "u-admin", role: "SUPER_ADMIN", centerId: null };

describe("permissions", () => {
  it("كل دور ومورد معرّف في المصفوفة", () => {
    for (const role of ROLES) expect(MATRIX[role]).toBeTruthy();
    for (const role of ROLES) for (const res of Object.keys(MATRIX[role])) expect(RESOURCES as readonly string[]).toContain(res);
  });

  it("عزل المراكز: لا وصول لمركز آخر", () => {
    expect(can(owner, "read", "student", { centerId: "c1" })).toBe(true);
    expect(can(owner, "read", "student", { centerId: "c2" })).toBe(false);
    expect(can(owner, "read", "payment", { centerId: "c2" })).toBe(false);
    expect(can(owner, "read", "student", {})).toBe(false); // نقص بيانات = رفض
  });

  it("المدير محصور بفروعه", () => {
    expect(can(manager, "update", "student", { centerId: "c1", branchId: "b1" })).toBe(true);
    expect(can(manager, "update", "student", { centerId: "c1", branchId: "b2" })).toBe(false);
    expect(can(manager, "update", "student", { centerId: "c2", branchId: "b1" })).toBe(false);
    expect(can(manager, "read", "student", { centerId: "c1" })).toBe(false);
  });

  it("السكرتير: يقبض الدفعات ولا يحذف ولا يرى الأجور", () => {
    const t = { centerId: "c1", branchId: "b1" };
    expect(can(secretary, "create", "payment", t)).toBe(true);
    expect(can(secretary, "delete", "payment", t)).toBe(false);
    expect(can(secretary, "read", "payout", t)).toBe(false);
    expect(can(secretary, "read", "expense", t)).toBe(false);
    expect(can(secretary, "delete", "student", t)).toBe(false);
  });

  it("المدير لا يرى الأجور ولا المصاريف", () => {
    const t = { centerId: "c1", branchId: "b1" };
    expect(can(manager, "read", "payout", t)).toBe(false);
    expect(can(manager, "read", "expense", t)).toBe(false);
  });

  it("الأستاذ: أفواجه فقط", () => {
    expect(can(teacher, "create", "attendance", { ownerId: "u-t1" })).toBe(true);
    expect(can(teacher, "create", "attendance", { ownerId: "u-t2" })).toBe(false);
    expect(can(teacher, "create", "payment", { ownerId: "u-t1" })).toBe(false);
    expect(can(teacher, "read", "payout", { ownerId: "u-t1" })).toBe(true);
  });

  it("الطالب: نفسه فقط، ولا مالية", () => {
    expect(can(student, "read", "attendance", { ownerId: "u-s1" })).toBe(true);
    expect(can(student, "read", "attendance", { ownerId: "u-s2" })).toBe(false);
    expect(can(student, "read", "invoice", { ownerId: "u-s1" })).toBe(false);
    expect(can(student, "read", "lesson")).toBe(true);
    expect(can(student, "update", "lesson")).toBe(false);
  });

  it("الولي: أبناؤه فقط وقراءة فقط", () => {
    expect(can(parent, "read", "invoice", { studentId: "s1" })).toBe(true);
    expect(can(parent, "read", "invoice", { studentId: "s2" })).toBe(false);
    expect(can(parent, "update", "invoice", { studentId: "s1" })).toBe(false);
    expect(can(parent, "read", "student", {})).toBe(false);
  });

  it("المشرف العام: المنهاج والمراكز، دون بيانات الطلاب والمالية", () => {
    expect(can(admin, "create", "curriculum")).toBe(true);
    expect(can(admin, "update", "center", { centerId: "c9" })).toBe(true);
    expect(can(admin, "read", "student", { centerId: "c1" })).toBe(false);
    expect(can(admin, "read", "payment", { centerId: "c1" })).toBe(false);
  });

  it("canRole للواجهة", () => {
    expect(canRole("SECRETARY", "create", "payment")).toBe(true);
    expect(canRole("PARENT", "create", "payment")).toBe(false);
  });

  it("scopeWhere و requireCenterId", () => {
    expect(scopeWhere(owner)).toEqual({ centerId: "c1" });
    expect(scopeWhere(manager)).toEqual({ centerId: "c1", branchId: { in: ["b1"] } });
    expect(scopeWhere({ ...secretary, branchIds: undefined })).toEqual({ centerId: "c1", branchId: { in: [] } });
    expect(() => requireCenterId(admin)).toThrow(TenantError);
  });
});
