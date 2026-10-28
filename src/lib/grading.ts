export function scaleTo20(score: number, maxScore: number): number {
  if (maxScore <= 0) return 0;
  const v = (score / maxScore) * 20;
  return Math.round(v * 100) / 100;
}

export function formatGrade(g: number): string {
  return g.toFixed(2);
}

export function gradeAttempt(answers: Array<{ type: string; correct: string | string[]; given: string }>) {
  let score = 0;
  let maxScore = 0;
  for (const a of answers) {
    maxScore += 1;
    if (a.type === "SHORT") {
      // simplified normalization
      const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");
      const correct = Array.isArray(a.correct) ? a.correct.map(norm) : [norm(a.correct)];
      if (correct.includes(norm(a.given))) score += 1;
    } else if (a.type === "MCQ") {
      if (a.given === a.correct) score += 1;
    } else if (a.type === "TRUE_FALSE") {
      if (a.given === a.correct) score += 1;
    }
  }
  return { score, maxScore };
}
