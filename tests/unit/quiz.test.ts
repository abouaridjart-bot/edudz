import { describe, expect, it } from "vitest";
import { gradeQuiz } from "@/lib/quiz";

describe("quiz", () => {
  it("يصحح MCQ متعدد الخيارات", () => {
    const res = gradeQuiz([{ questionId: "1", type: "MCQ", correct: ["A", "C"], given: ["C", "A"] }]);
    expect(res.score).toBe(1);
  });
  it("يصحح صحيح/خطأ", () => {
    const res = gradeQuiz([{ questionId: "2", type: "TRUE_FALSE", correct: "true", given: "true" }]);
    expect(res.score).toBe(1);
  });
  it("يصحح قصير بالتطبيع", () => {
    const res = gradeQuiz([{ questionId: "3", type: "SHORT", correct: ["الجزائر"], given: [" الجزائر "] }]);
    expect(res.score).toBe(1);
    expect(res.scaled20).toBe(20);
  });
});
