import { makeQuestion, product } from "../session/adultGate";

describe("AdultGate question helper", () => {
  it("returns a 10–99 × 2–9 product", () => {
    const seenA = new Set<number>();
    const seenB = new Set<number>();
    for (let i = 0; i < 90; i += 1) {
      const question = makeQuestion(() => i / 90);
      expect(question.a).toBeGreaterThanOrEqual(10);
      expect(question.a).toBeLessThanOrEqual(99);
      expect(question.b).toBeGreaterThanOrEqual(2);
      expect(question.b).toBeLessThanOrEqual(9);
      expect(product(question)).toBe(question.a * question.b);
      seenA.add(question.a);
      seenB.add(question.b);
    }
    expect(seenA.has(10)).toBe(true);
    expect(seenA.has(99)).toBe(true);
    expect(seenB.has(2)).toBe(true);
    expect(seenB.has(9)).toBe(true);
  });

  it("maps a fixed random stream to 10 × 2", () => {
    const question = makeQuestion(() => 0);
    expect(question).toEqual({ a: 10, b: 2 });
    expect(product(question)).toBe(20);
  });
});
