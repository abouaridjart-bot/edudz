"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import { createStudent } from "./actions";

export interface StudentFormBranch {
  id: string;
  name: string;
}

export interface StudentFormLevel {
  id: string;
  nameAr: string;
}

export interface StudentFormStream {
  id: string;
  levelId: string;
  nameAr: string;
}

export function StudentForm({
  branches,
  levels,
  streams,
}: {
  branches: StudentFormBranch[];
  levels: StudentFormLevel[];
  streams: StudentFormStream[];
}) {
  const firstLevelId = levels[0]?.id ?? "";
  const [levelId, setLevelId] = useState(firstLevelId);
  const visibleStreams = streams.filter((s) => s.levelId === levelId);

  if (branches.length === 0 || levels.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        لا يمكن إضافة طالب قبل توفر فرع ومستوى دراسي.
      </p>
    );
  }

  return (
    <form action={createStudent} className="panel">
      <div className="flex items-center gap-2 border-b p-4">
        <UserPlus className="size-5 text-primary" aria-hidden />
        <h2 className="font-bold">إضافة طالب</h2>
      </div>

      <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1.5">
          <span className="field-label">الاسم الكامل</span>
          <input name="fullName" required minLength={3} maxLength={100} className="field-input" />
        </label>

        <label className="space-y-1.5">
          <span className="field-label">
            الهاتف <span className="text-muted-foreground">(اختياري)</span>
          </span>
          <input name="phone" type="tel" inputMode="tel" placeholder="0551234567" className="field-input" />
        </label>

        <label className="space-y-1.5">
          <span className="field-label">
            البريد الإلكتروني <span className="text-muted-foreground">(للتفعيل)</span>
          </span>
          <input
            name="email"
            type="email"
            inputMode="email"
            dir="ltr"
            placeholder="student@example.com"
            autoComplete="off"
            className="field-input"
          />
        </label>

        <label className="space-y-1.5">
          <span className="field-label">الفرع</span>
          <select name="branchId" required defaultValue={branches[0].id} className="field-input">
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="field-label">المستوى الدراسي</span>
          <select
            name="levelId"
            required
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="field-input"
          >
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="field-label">
            الشعبة <span className="text-muted-foreground">(اختياري)</span>
          </span>
          <select
            key={levelId}
            name="streamId"
            defaultValue=""
            disabled={visibleStreams.length === 0}
            className="field-input"
          >
            <option value="">بدون شعبة</option>
            {visibleStreams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1.5">
          <span className="field-label">
            تاريخ الميلاد <span className="text-muted-foreground">(اختياري)</span>
          </span>
          <input name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} className="field-input" />
        </label>

        <label className="space-y-1.5">
          <span className="field-label">
            المدرسة <span className="text-muted-foreground">(اختياري)</span>
          </span>
          <input name="schoolName" maxLength={120} className="field-input" />
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className="field-label">
            ملاحظات <span className="text-muted-foreground">(اختياري)</span>
          </span>
          <input name="notes" maxLength={1000} className="field-input" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t p-4">
        <button className="inline-flex min-h-10 items-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
          إضافة الطالب
        </button>
        <span className="text-xs text-muted-foreground">
          يُنشأ حساب الطالب غير مفعّل؛ أضف بريداً إلكترونياً ثم أنشئ رابط تفعيل من القائمة ليتمكن من الدخول.
        </span>
      </div>
    </form>
  );
}
