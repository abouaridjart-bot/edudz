import { describe, expect, it } from "vitest";
import { buildSearchText } from "@/lib/build-search-text";

describe("buildSearchText", () => {
  it("يطبّع ويطابق التطبيع", () => {
    const s = buildSearchText(["المعادلات", "الخطية"]);
    expect(s).toContain("معادلات");
    expect(s.length).toBeGreaterThan(0);
  });
});
