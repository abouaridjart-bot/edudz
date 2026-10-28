const ARABIC_INDIC = "٠١٢٣٤٥٦٧٨٩";
const EASTERN_PERSIAN = "۰۱۲۳۴۵۶۷۸۹";

/** يحوّل الأرقام الهندية/الفارسية إلى أرقام غربية 0-9. */
export function toWesternDigits(input: string): string {
  let out = "";
  for (const ch of input) {
    const a = ARABIC_INDIC.indexOf(ch);
    if (a >= 0) {
      out += String(a);
      continue;
    }
    const p = EASTERN_PERSIAN.indexOf(ch);
    out += p >= 0 ? String(p) : ch;
  }
  return out;
}
