/**
 * مصفوفة الصلاحيات المركزية (role × resource × action) — المرحلة 2.
 * مبدأ: الرفض افتراضياً. أي نقص في بيانات الهدف (target) = رفض.
 */
export const ROLES = ["SUPER_ADMIN", "CENTER_OWNER", "BRANCH_MANAGER", "SECRETARY", "TEACHER", "STUDENT", "PARENT"] as const;
export type Role = (typeof ROLES)[number];

export type Action = "read" | "create" | "update" | "delete";

export const RESOURCES = [
  "curriculum", "lesson", "exam_archive", "quiz", "assignment", "submission",
  "center", "branch", "room", "user",
  "student", "parent", "teacher", "group", "enrollment", "schedule", "session", "attendance",
  "invoice", "payment", "payout", "expense", "report", "audit_log",
] as const;
export type Resource = (typeof RESOURCES)[number];

/** نطاق القاعدة: platform = المنصة كلها، center = مركز المستخدم، branch = فروعه، own = ما يملكه، children = أبناؤه. */
export type Scope = "platform" | "center" | "branch" | "own" | "children";

interface Rule {
  actions: readonly Action[];
  scope: Scope;
}

const ALL: readonly Action[] = ["read", "create", "update", "delete"];
const RCU: readonly Action[] = ["read", "create", "update"];
const R: readonly Action[] = ["read"];
const RU: readonly Action[] = ["read", "update"];

type Matrix = Record<Role, Partial<Record<Resource, Rule>>>;

export const MATRIX: Matrix = {
  // المشرف العام: المنهاج والمراكز والدعم. لا يرى بيانات الطلاب أو المالية داخل المراكز (خصوصية).
  SUPER_ADMIN: {
    curriculum: { actions: ALL, scope: "platform" },
    lesson: { actions: ALL, scope: "platform" },
    exam_archive: { actions: ALL, scope: "platform" },
    center: { actions: ALL, scope: "platform" },
    user: { actions: RU, scope: "platform" },
    audit_log: { actions: R, scope: "platform" },
  },
  CENTER_OWNER: Object.fromEntries(
    (["lesson", "quiz", "assignment", "submission", "branch", "room", "user", "student", "parent", "teacher", "group",
      "enrollment", "schedule", "session", "attendance", "invoice", "payment", "payout", "expense", "report", "audit_log"] as Resource[])
      .map((r) => [r, { actions: r === "audit_log" || r === "report" ? R : ALL, scope: "center" } as Rule]),
  ) as Matrix["CENTER_OWNER"],
  BRANCH_MANAGER: {
    lesson: { actions: ALL, scope: "branch" },
    room: { actions: ALL, scope: "branch" },
    branch: { actions: R, scope: "branch" },
    student: { actions: ALL, scope: "branch" },
    parent: { actions: RCU, scope: "branch" },
    teacher: { actions: R, scope: "branch" },
    group: { actions: ALL, scope: "branch" },
    enrollment: { actions: ALL, scope: "branch" },
    schedule: { actions: ALL, scope: "branch" },
    session: { actions: ALL, scope: "branch" },
    attendance: { actions: RU, scope: "branch" },
    invoice: { actions: RCU, scope: "branch" },
    payment: { actions: RCU, scope: "branch" },
    payout: { actions: ALL, scope: "center" },
    expense: { actions: ALL, scope: "center" },
    report: { actions: R, scope: "center" },
  },
  SECRETARY: {
    room: { actions: R, scope: "branch" },
    branch: { actions: R, scope: "branch" },
    teacher: { actions: R, scope: "branch" },
    student: { actions: RCU, scope: "branch" },
    parent: { actions: RCU, scope: "branch" },
    group: { actions: R, scope: "branch" },
    enrollment: { actions: RCU, scope: "branch" },
    schedule: { actions: R, scope: "branch" },
    session: { actions: R, scope: "branch" },
    attendance: { actions: RCU, scope: "branch" },
    invoice: { actions: R, scope: "branch" },
    payment: { actions: RCU, scope: "branch" },
  },
  TEACHER: {
    lesson: { actions: ALL, scope: "own" },
    quiz: { actions: ALL, scope: "own" },
    assignment: { actions: ALL, scope: "own" },
    submission: { actions: RU, scope: "own" },
    group: { actions: R, scope: "own" },
    session: { actions: R, scope: "own" },
    attendance: { actions: RCU, scope: "own" },
    student: { actions: R, scope: "own" },
    payout: { actions: R, scope: "own" },
  },
  STUDENT: {
    lesson: { actions: R, scope: "platform" }, // الرؤية (PUBLIC/CENTER/GROUP) تُفحص في طبقة الاستعلام
    exam_archive: { actions: R, scope: "platform" },
    quiz: { actions: R, scope: "platform" },
    assignment: { actions: R, scope: "own" },
    submission: { actions: RCU, scope: "own" },
    schedule: { actions: R, scope: "own" },
    session: { actions: R, scope: "own" },
    attendance: { actions: R, scope: "own" },
  },
  PARENT: {
    student: { actions: R, scope: "children" },
    schedule: { actions: R, scope: "children" },
    attendance: { actions: R, scope: "children" },
    assignment: { actions: R, scope: "children" },
    submission: { actions: R, scope: "children" },
    invoice: { actions: R, scope: "children" },
    payment: { actions: R, scope: "children" },
  },
};

export interface Actor {
  id: string;
  role: Role;
  centerId: string | null;
  /** الفروع المسندة (للمدير/السكرتير). */
  branchIds?: readonly string[];
  /** أبناء الولي. */
  childStudentIds?: readonly string[];
}

export interface Target {
  centerId?: string | null;
  branchId?: string | null;
  /** User.id لمالك المورد (الأستاذ المسؤول، أو الطالب صاحب الملف…). */
  ownerId?: string | null;
  /** Student.id للطالب المعني (لنطاق children الخاص بالولي). */
  studentId?: string | null;
}

/** هل يملك الدور هذه القدرة في أي نطاق؟ (لإظهار/إخفاء عناصر الواجهة فقط — ليست فحص أمان). */
export function canRole(role: Role, action: Action, resource: Resource): boolean {
  return MATRIX[role][resource]?.actions.includes(action) ?? false;
}

/**
 * فحص القدرة على مستوى **قائمة** لا صفّ محدد: يكفي أن الدور يملك الإجراء وأن المستخدم
 * مرتبط بمركز (لنطاقي center/branch). تصفية الصفوف نفسها تتم عبر `scopeWhere`.
 * لا تستخدمها بديلاً عن `can` عند تعديل/قراءة صف بعينه.
 */
export function canList(actor: Actor, action: Action, resource: Resource): boolean {
  const rule = MATRIX[actor.role][resource];
  if (!rule || !rule.actions.includes(action)) return false;
  if (rule.scope === "center" || rule.scope === "branch") return !!actor.centerId;
  return true; // platform / own / children: التصفية في الاستعلام نفسه
}

/** فحص الأمان الصارم: الدور + النطاق + بيانات الهدف. أي نقص = رفض. */
export function can(actor: Actor, action: Action, resource: Resource, target: Target = {}): boolean {
  const rule = MATRIX[actor.role][resource];
  if (!rule || !rule.actions.includes(action)) return false;

  switch (rule.scope) {
    case "platform":
      // قواعد المنصة للمشرف العام بلا قيد مركز؛ لبقية الأدوار (قراءة المحتوى) لا قيد على المركز.
      return true;
    case "center":
      return !!actor.centerId && target.centerId === actor.centerId;
    case "branch":
      return (
        !!actor.centerId &&
        target.centerId === actor.centerId &&
        !!target.branchId &&
        !!actor.branchIds?.includes(target.branchId)
      );
    case "own":
      // ownerId = معرّف المستخدم (User.id) صاحب المورد: الأستاذ المسؤول أو الطالب نفسه.
      return !!target.ownerId && target.ownerId === actor.id;
    case "children":
      return !!target.studentId && !!actor.childStudentIds?.includes(target.studentId);
    default:
      return false;
  }
}

// ---------- عزل المراكز (Multi-tenant) ----------
export class TenantError extends Error {}

/** معرّف المركز المطلوب لأي استعلام مرتبط بمركز؛ يرمي خطأ إن لم يكن للمستخدم مركز. */
export function requireCenterId(actor: Actor): string {
  if (!actor.centerId) throw new TenantError("actor has no center");
  return actor.centerId;
}

/** شرط where جاهز للدمج في استعلامات Prisma: مركز المستخدم + فروعه إن كان محصوراً بفروع. */
export function scopeWhere(actor: Actor): { centerId: string; branchId?: { in: string[] } } {
  const centerId = requireCenterId(actor);
  if (isBranchScoped(actor)) {
    return { centerId, branchId: { in: [...(actor.branchIds ?? [])] } };
  }
  return { centerId };
}

function isBranchScoped(actor: Actor): boolean {
  return actor.role === "BRANCH_MANAGER" || actor.role === "SECRETARY";
}

/**
 * الفروع المسموحة للمستخدم، أو `undefined` إذا كان الوصول لكل فروع المركز.
 * تُستخدم للجداول التي لا تحمل `branchId` (Session, Invoice, Teacher…): يُبنى الشرط على علاقة وسيطة.
 */
export function allowedBranchIds(actor: Actor): string[] | undefined {
  return isBranchScoped(actor) ? [...(actor.branchIds ?? [])] : undefined;
}

/**
 * شرط where لجدول `Branch` نفسه (لا يحمل عمود `branchId` بل مفتاحه `id`).
 * لا تستخدم `scopeWhere` مع Branch — ينتج عنه `branchId` غير موجود.
 */
export function branchWhere(actor: Actor): { centerId: string; id?: { in: string[] } } {
  const centerId = requireCenterId(actor);
  const branchIds = allowedBranchIds(actor);
  return branchIds ? { centerId, id: { in: branchIds } } : { centerId };
}
