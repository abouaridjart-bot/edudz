"use client";

import { useState, useTransition } from "react";
import { Lock, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

interface LoginFormProps {
  loginAction: (formData: FormData) => Promise<void>;
  labels: {
    identifier: string;
    password: string;
    signIn: string;
    secureNote: string;
    invalid: string;
  };
  error?: boolean;
  activated?: boolean;
}

export function LoginForm({ loginAction, labels, error, activated }: LoginFormProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await loginAction(formData);
    });
  };

  return (
    <div className="panel relative overflow-hidden backdrop-blur-xl bg-white/80 border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] p-8 md:p-10 rounded-2xl">
      <div className="absolute top-0 right-0 -mt-4 -mr-4 size-24 bg-indigo-500/10 rounded-full blur-2xl" />
      <div className="absolute bottom-0 left-0 -mb-4 -ml-4 size-24 bg-blue-500/10 rounded-full blur-2xl" />

      <div className="relative">
        {activated ? (
          <div className="mb-6 p-4 bg-emerald-50/80 border border-emerald-100 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <CheckCircle className="size-5 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-sm text-emerald-800 font-medium leading-relaxed">
              تم تفعيل الحساب بنجاح. سجّل الدخول بكلمة المرور الجديدة.
            </p>
          </div>
        ) : null}

        {error ? (
          <div className="mb-6 p-4 bg-rose-50/80 border border-rose-100 rounded-xl flex items-start gap-3 backdrop-blur-sm">
            <AlertTriangle className="size-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800 font-medium leading-relaxed">{labels.invalid}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-950/80 mr-1">{labels.identifier}</label>
            <input
              name="identifier"
              autoComplete="username"
              inputMode="email"
              dir="ltr"
              required
              className="w-full h-12 px-4 bg-white/60 border border-indigo-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-indigo-200 text-indigo-950 font-medium text-start"
              placeholder="name@example.com"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-indigo-950/80 mr-1">{labels.password}</label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              dir="ltr"
              required
              className="w-full h-12 px-4 bg-white/60 border border-indigo-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all placeholder:text-indigo-200 text-indigo-950 font-medium text-start"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="group relative w-full h-12 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200/50 active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {isPending ? (
              <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <span>{labels.signIn}</span>
                <ArrowRight className="size-5 transition-transform group-hover:-translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-indigo-50 flex flex-col items-center gap-4 text-xs font-medium text-indigo-950/50">
          <p className="flex items-center gap-1.5">
            <Lock className="size-3.5" />
            {labels.secureNote}
          </p>
        </div>
      </div>
    </div>
  );
}
