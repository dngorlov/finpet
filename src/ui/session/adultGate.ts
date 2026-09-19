export type AdultQuestion = { a: number; b: number };

/** Two-digit × one-digit (10–99 × 2–9). `random` is injectable for tests. */
export function makeQuestion(random: () => number = Math.random): AdultQuestion {
  const a = 10 + Math.floor(random() * 90);
  const b = 2 + Math.floor(random() * 8);
  return { a, b };
}

export function product(question: AdultQuestion): number {
  return question.a * question.b;
}
