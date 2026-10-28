"use client";

import { useState } from "react";
import { Plus, Receipt } from "lucide-react";
import { createExpense } from "./actions";

export function ExpenseForm({
  branches,
  categories,
}: {
  branches: { id: string; name: string }[];
  categories: string[];
}) {
  const [loading, setLoading] = useState(false);

  return (
    <div className="panel p-6">
      <div className="flex items-center gap-2 mb-6">
        <Receipt className="size-5 text-primary" />
        <h2 className="text-xl font-bold">تسجيل مصروف جديد</h2>
      </div>

      <form
        action={async (formData) => {
          setLoading(true);
          try {
            await createExpense(formData);
          } finally {
            setLoading(false);
          }
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="field-label">الفرع</span>
            <select name="branchId" required className="field-input">
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1.5">
            <span className="field-label">التصنيف</span>
            <select name="category" required className="field-input">
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="field-label">المبلغ (دينار)</span>
            <input
              name="amount"
              type="number"
              required
              min="1"
              placeholder="0"
              className="field-input"
            />
          </label>

          <label className="space-y-1.5">
            <span className="field-label">التاريخ</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={new Date().toISOString().split("T")[0]}
              className="field-input"
            />
          </label>
        </div>

        <label className="space-y-1.5">
          <span className="field-label">ملاحظات (اختياري)</span>
          <textarea
            name="note"
            rows={2}
            maxLength={255}
            className="field-input resize-none"
            placeholder="تفاصيل المصروف..."
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? (
            "جاري الحفظ..."
          ) : (
            <>
              <Plus className="size-4" />
              حفظ المصروف
            </>
          )}
        </button>
      </form>
    </div>
  );
}
