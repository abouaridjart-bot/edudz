import { normalizeArabic } from "@/lib/arabic";

export function buildSearchText(parts: Array<string | null | undefined>): string {
  const combined = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .join(" ");
  return normalizeArabic(combined);
}
