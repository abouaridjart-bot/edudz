"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

export function SubmitButton({ children }: { children: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      className="group relative w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <svg
            className="size-5 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-90"
              fill="currentColor"
              d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z"
            />
          </svg>
          <span>جارٍ التحقق…</span>
        </>
      ) : (
        <span>{children}</span>
      )}
    </button>
  );
}
