import * as React from "react";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const VARIANTS = {
  success: {
    className: "border-emerald-600/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200",
    Icon: CheckCircle2,
    role: "status" as const,
  },
  error: {
    className: "border-destructive/40 bg-destructive/10 text-destructive",
    Icon: AlertTriangle,
    role: "alert" as const,
  },
  info: {
    className: "border-border bg-muted/60 text-foreground",
    Icon: Info,
    role: "status" as const,
  },
};

export function Alert({
  variant = "info",
  className,
  children,
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
  children: React.ReactNode;
}) {
  const { className: tone, Icon, role } = VARIANTS[variant];
  return (
    <div role={role} className={cn("flex items-start gap-2 rounded-lg border p-3 text-sm", tone, className)}>
      <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <div className="min-w-0 leading-relaxed">{children}</div>
    </div>
  );
}
