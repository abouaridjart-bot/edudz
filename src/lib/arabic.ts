import { toWesternDigits } from "./digits";

export function normalizeArabic(text: string): string {
  if (!text) return "";
  let normalized = toWesternDigits(text);
  normalized = normalized
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ـ+/g, "")
    .replace(/[^\u0621-\u063A\u0641-\u064A\u0660-\u0669\u06F0-\u06F9\u0030-\u0039\sA-Za-z]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
  return normalized;
}

export function tokenize(text: string | string[]): string[] {
  if (Array.isArray(text)) {
    return text.flatMap((t) => tokenize(t));
  }
  const normalized = normalizeArabic(text);
  return normalized.split(/\s+/).filter(Boolean);
}

export function matchesQuery(haystack: string, query: string): boolean {
  const h = normalizeArabic(haystack);
  const q = normalizeArabic(query);
  if (!q || q === "" || q.trim() === "") return false;
  const queryTokens = q.split(/\s+/).filter(Boolean);
  if (queryTokens.length === 0) return false;
  const haystackTokens = h.split(/\s+/).filter(Boolean);
  // Check if all query tokens are found (either as substring match or token match)
  return queryTokens.every((qt) => {
    if (h.includes(qt)) return true;
    return haystackTokens.some((ht) => ht.includes(qt) || qt.includes(ht));
  });
}

export function answersMatch(a: string, b: string | string[]): boolean {
  const normalizedA = normalizeArabic(a);
  if (!normalizedA) return false;
  if (Array.isArray(b)) {
    if (b.length === 0) return false;
    return b.some((val) => {
      const nv = normalizeArabic(val);
      if (!nv) return false;
      return nv === normalizedA;
    });
  }
  if (!b) return false;
  const nb = normalizeArabic(b);
  if (!nb) return false;
  return nb === normalizedA;
}

export function buildSearchText(parts: string[]): string {
  return parts
    .filter(Boolean)
    .map((p) => normalizeArabic(p))
    .join(" ");
}
