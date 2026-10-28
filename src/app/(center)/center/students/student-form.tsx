"use client";

import { useState } from "react";
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
      <p className="rounded border border-dashed p-3 text-sm text-muted-foreground">
        لا يمكن إضافة طالب قبل توفر فرع ومستوى دراسي.
      </p>
    );
  }

  return (
    <form action={createStudent} className="space-y-3 rounded border p-4">
      <h2 className="text-lg font-semibold">إضافة طالب</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <label className="space-y-1 text-sm">
          <span className="block font-medium">الاسم الكامل</span>
          <input
            name="fullName"
            required
            minLength={3}
            maxLength={100}
            className="w-full rounded border px-2 py-1"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">الهاتف (اختياري)</span>
          <input
            name="phone"
            type="tel"
            inputMode="tel"
            placeholder="0551234567"
            className="w-full rounded border px-2 py-1"
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">الفرع</span>
          <select name="branchId" required defaultValue={branches[0].id} className="w-full rounded border px-2 py-1">
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">المستوى الدراسي</span>
          <select
            name="levelId"
            required
            value={levelId}
            onChange={(e) => setLevelId(e.target.value)}
            className="w-full rounded border px-2 py-1"
          >
            {levels.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">الشعبة (اختياري)</span>
          <select
            key={levelId}
            name="streamId"
            defaultValue=""
            disabled={visibleStreams.length === 0}
            className="w-full rounded border px-2 py-1 disabled:opacity-50"
          >
            <option value="">بدون شعبة</option>
            {visibleStreams.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nameAr}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">تاريخ الميلاد (اختياري)</span>
          <input name="birthDate" type="date" max={new Date().toISOString().slice(0, 10)} className="w-full rounded border px-2 py-1" />
        </label>

        <label className="space-y-1 text-sm">
          <span className="block font-medium">المدرسة (اختياري)</span>
          <input name="schoolName" maxLength={120} className="w-full rounded border px-2 py-1" />
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="block font-medium">ملاحظات (اختياري)</span>
          <input name="notes" maxLength={1000} className="w-full rounded border px-2 py-1" />
        </label>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button className="rounded bg-primary px-4 py-1.5 text-primary-foreground">إضافة الطالب</button>
        <span className="text-xs text-muted-foreground">
          يُنشأ حساب الطالب غير مفعّل؛ يفعّله المسؤول لاحقاً قبل السماح له بالدخول.
        </span>
      </div>
    </form>
  );
}
