"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** حقل قراءة فقط لرابط طويل مع زر نسخ إلى الحافظة. */
export function CopyField({ value, label = "رابط" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // المتصفح قد يمنع الحافظة؛ يبقى النص قابلاً للتحديد يدوياً.
    }
  }

  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        readOnly
        value={value}
        dir="ltr"
        aria-label={label}
        onFocus={(e) => e.currentTarget.select()}
        className="field-input min-h-9 flex-1 font-mono text-xs"
      />
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "تم النسخ" : `نسخ ${label}`}
        className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-muted"
      >
        {copied ? <Check className="size-4 text-emerald-600" aria-hidden /> : <Copy className="size-4" aria-hidden />}
        {copied ? "نُسخ" : "نسخ"}
      </button>
    </div>
  );
}
