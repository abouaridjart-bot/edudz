/** سياسة كلمات المرور — منطق نقي يُستخدم في الخادم وفي النماذج. */

export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

/**
 * يعيد رسالة عربية توضح سبب الرفض، أو null إن كانت كلمة المرور مقبولة.
 * الشروط: 8–128 محرفاً، وحرف واحد على الأقل، ورقم واحد على الأقل.
 */
export function passwordProblem(password: string): string | null {
  if (password.length < PASSWORD_MIN) return `كلمة المرور يجب أن تكون ${PASSWORD_MIN} محارف على الأقل`;
  if (password.length > PASSWORD_MAX) return `كلمة المرور طويلة جداً (${PASSWORD_MAX} محرفاً كحد أقصى)`;
  if (!/\p{L}/u.test(password)) return "أضف حرفاً واحداً على الأقل إلى كلمة المرور";
  if (!/\d/.test(password)) return "أضف رقماً واحداً على الأقل إلى كلمة المرور";
  return null;
}

/** يتحقق من التطابق أيضاً؛ يعيد أول مشكلة أو null. */
export function newPasswordProblem(password: string, confirm: string): string | null {
  const problem = passwordProblem(password);
  if (problem) return problem;
  if (password !== confirm) return "كلمتا المرور غير متطابقتين";
  return null;
}
