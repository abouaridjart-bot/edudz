export interface QuizAnswer {
  questionId: string;
  type: string;
  correct: string | string[];
  given: string | string[];
}

export function gradeQuiz(answers: QuizAnswer[]) {
  let score = 0;
  const maxScore = answers.length;
  for (const a of answers) {
    if (a.type === "MCQ") {
      if (Array.isArray(a.given) && Array.isArray(a.correct)) {
        const g = [...a.given].sort().join(",");
        const c = [...a.correct].sort().join(",");
        if (g === c) score += 1;
      } else if (a.given === a.correct) {
        score += 1;
      }
    } else if (a.type === "TRUE_FALSE") {
      if (a.given === a.correct) score += 1;
    } else if (a.type === "SHORT") {
      const norm = (s: string) => String(s).trim().toLowerCase().replace(/\s+/g, " ");
      const correctList = Array.isArray(a.correct) ? a.correct.map(norm) : [norm(a.correct as string)];
      const givenList = Array.isArray(a.given) ? a.given.map(norm) : [norm(a.given as string)];
      if (correctList.some((c) => givenList.includes(c))) score += 1;
    }
  }
  return { score, maxScore, scaled20: Math.round((score / Math.max(1, maxScore)) * 20 * 100) / 100 };
}
