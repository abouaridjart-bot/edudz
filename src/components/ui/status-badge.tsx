import * as React from "react";
import { cn } from "@/lib/utils";
import type { StatusLabel, Tone } from "@/lib/labels";

const TONES: Record<Tone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/20 text-amber-800 dark:text-amber-300",
  danger: "bg-destructive/15 text-destructive",
};

/** شارة حالة موحّدة: تقبل النتيجة من `lib/labels` أو نصاً + لوناً مباشرين. */
export function StatusBadge({
  status,
  className,
}: {
  status: StatusLabel;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        TONES[status.tone],
        className,
      )}
    >
      {status.label}
    </span>
  );
}

export function ToneBadge({ tone, children, className }: { tone: Tone; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", TONES[tone], className)}>
      {children}
    </span>
  );
}
