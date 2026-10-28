"use client";

export function InviteForm() {
  return (
    <form className="space-y-4 max-w-md">
      <div className="space-y-2">
        <label className="text-sm">الهاتف أو البريد</label>
        <input name="identifier" className="w-full border rounded px-3 py-2" required />
      </div>
      <div className="space-y-2">
        <label className="text-sm">الدور</label>
        <select name="role" className="w-full border rounded px-3 py-2">
          <option value="TEACHER">أستاذ</option>
          <option value="SECRETARY">سكرتير</option>
          <option value="BRANCH_MANAGER">مدير فرع</option>
          <option value="PARENT">ولي أمر</option>
        </select>
      </div>
      <button className="bg-primary text-primary-foreground px-4 py-2 rounded">دعوة</button>
    </form>
  );
}
