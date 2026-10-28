import { describe, expect, it } from "vitest";
import { generateReceiptNo, nextReceiptNo } from "@/lib/receipts";

describe("receipts", () => {
  it("ينشئ رقم إيصال متسلسل", () => {
    expect(generateReceiptNo(2026, 1)).toBe("RC-26-000001");
    expect(nextReceiptNo(null, 2026)).toBe("RC-26-000001");
    expect(nextReceiptNo("RC-26-000005", 2026)).toBe("RC-26-000006");
  });
});
