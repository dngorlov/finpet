import { applyGoalProgress, checkWithdrawal, estimateDaysToGoal, potFromTransfers } from "../savings";

describe("savings pot", () => {
  it("is the sum of deposits minus withdrawals and never goes below zero on a refused withdrawal", () => {
    const pot = potFromTransfers([
      { amount: 20, kind: "in" },
      { amount: 5, kind: "out" },
    ]);

    expect(pot).toBe(15);
    expect(checkWithdrawal(pot, 20)).toEqual({ ok: false, potAfter: -5 });
    expect(checkWithdrawal(pot, 15)).toEqual({ ok: true, potAfter: 0 });
  });
});

describe("goal progress", () => {
  it("marks the goal funded when the pot covers the cost and leaves the pot unchanged", () => {
    expect(applyGoalProgress(90, 90)).toEqual({ achieved: true, potAfter: 90, remaining: 0 });
    expect(applyGoalProgress(100, 90)).toEqual({ achieved: true, potAfter: 100, remaining: 0 });
    expect(applyGoalProgress(40, 90)).toEqual({ achieved: false, potAfter: 40, remaining: 50 });
  });
});

describe("completion-date estimate", () => {
  it("is «—» (null) before the first transfer", () => {
    expect(estimateDaysToGoal(90, [])).toBeNull();
  });

  it("is remaining divided by the average recent deposit, rounded up", () => {
    expect(estimateDaysToGoal(75, [15])).toBe(5);
  });

  it("does not increase after a second equal deposit", () => {
    const afterFirst = estimateDaysToGoal(75, [15]);
    const afterSecond = estimateDaysToGoal(60, [15, 15]);

    expect(afterFirst).toBe(5);
    expect(afterSecond).toBe(4);
    expect(afterSecond!).toBeLessThan(afterFirst!);
  });
});
