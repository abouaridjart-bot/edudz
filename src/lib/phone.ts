import { toWesternDigits } from "./digits";

export function normalizeAlgerianMobile(phone: string): string | null {
  if (!phone) return null;
  let cleaned = toWesternDigits(phone);
  cleaned = cleaned.replace(/\s+/g, "").replace(/[-()]/g, "").replace(/\./g, "");
  if (cleaned.startsWith("00213")) {
    cleaned = "+" + cleaned.slice(2);
  }
  if (cleaned.startsWith("213") && cleaned.length === 12) {
    cleaned = "+" + cleaned;
  }
  if (cleaned.startsWith("+213(0)")) {
    cleaned = "+213" + cleaned.slice("+213(0)".length);
  }
  if (cleaned.startsWith("+2130")) {
    cleaned = "+213" + cleaned.slice(5);
  }
  if (/^(\+213|0)(5|6|7)[0-9]{8}$/.test(cleaned)) {
    if (cleaned.startsWith("0")) {
      return "+213" + cleaned.slice(1);
    }
    return cleaned;
  }
  return null;
}

export function formatPhoneNational(phone: string): string {
  const normalized = normalizeAlgerianMobile(phone);
  if (!normalized) return phone;
  if (normalized.startsWith("+213")) {
    const num = normalized.slice(4);
    return `0${num.slice(0, 3)} ${num.slice(3, 5)} ${num.slice(5, 7)} ${num.slice(7, 9)}`;
  }
  return normalized;
}

export function isValidAlgerianMobile(phone: string): boolean {
  return normalizeAlgerianMobile(phone) !== null;
}
