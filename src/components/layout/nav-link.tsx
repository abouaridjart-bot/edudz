"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CalendarRange,
  ClipboardCheck,
  ClipboardList,
  FileText,
  LayoutDashboard,
  Layers,
  Mail,
  ReceiptText,
  Users,
  UsersRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  dashboard: LayoutDashboard,
  students: Users,
  groups: UsersRound,
  sessions: CalendarDays,
  attendance: ClipboardCheck,
  invoices: ReceiptText,
  payments: Wallet,
  teachers: Users,
  branches: Building2,
  reports: BarChart3,
  notifications: Bell,
  curriculum: BookOpen,
  units: Layers,
  lessons: FileText,
  years: CalendarRange,
  invitations: Mail,
  quizzes: ClipboardList,
  children: Users,
} satisfies Record<string, LucideIcon>;

export type NavIcon = keyof typeof ICONS;

export function NavLink({ href, icon, children }: { href: string; icon?: NavIcon; children: React.ReactNode }) {
  const pathname = usePathname();
  const active = pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const Icon = icon ? ICONS[icon] : null;
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "inline-flex min-h-10 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
        active && "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary",
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" aria-hidden /> : null}
      <span>{children}</span>
    </Link>
  );
}
