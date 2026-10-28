import { describe, expect, it } from "vitest";
import { gradeAttempt, scaleTo20 } from "@/lib/grading";

describe("grading", () => {
  it("يصحح MCQ وTRUE_FALSE", () => {
    const res = gradeAttempt([
      { type: "MCQ", correct: "A", given: "A" },
      { type: "TRUE_FALSE", correct: "true", given: "false" },
    ]);
    expect(res.score).toBe(1);
    expect(res.maxScore).toBe(2);
  });

  it("يصحح SHORT بالتطبيع", () => {
    const res = gradeAttempt([
      { type: "SHORT", correct: ["الجزائر", "algeria"], given: "  الجزائر  " },
    ]);
    expect(res.score).toBe(1);
  });

  it("يحول إلى /20", () => {
    expect(scaleTo20(8, 10)).toBe(16);
  });
});
