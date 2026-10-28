export function generateReceiptNo(year: number, seq: number): string {
  const y = String(year).slice(-2);
  const s = String(seq).padStart(6, "0");
  return `RC-${y}-${s}`;
}

export function nextReceiptNo(last: string | null, year: number): string {
  if (!last) return generateReceiptNo(year, 1);
  const parts = last.split("-");
  const seq = parseInt(parts[2] || "0", 10) + 1;
  return generateReceiptNo(year, seq);
}
