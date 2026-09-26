import {
  allocationStatus,
  factFromSpending,
  planAfterEvent,
  planFactDiff,
  replanPaidBy,
  roundsToGoal,
} from "../budgetGames";

describe("budget games", () => {
  it("tells short, over and exact", () => {
    expect(allocationStatus({ mandatory: 40, wants: 30, savings: 20 }, 100)).toEqual({ kind: "short", left: 10 });
    expect(allocationStatus({ mandatory: 50, wants: 30, savings: 30 }, 100)).toEqual({ kind: "over", over: 10 });
    expect(allocationStatus({ mandatory: 40, wants: 30, savings: 30 }, 100)).toEqual({ kind: "exact" });
  });

  it("finds which bucket paid for the surprise", () => {
    const before = { mandatory: 40, wants: 30, savings: 30 };
    const bumped = planAfterEvent(before, { bucket: "mandatory", delta: 10 });
    expect(bumped.mandatory).toBe(50);
    expect(replanPaidBy(before, { mandatory: 50, wants: 20, savings: 30 }, "mandatory")).toBe("wants");
    expect(replanPaidBy(before, { mandatory: 50, wants: 25, savings: 25 }, "mandatory")).toBe("wants");
    expect(replanPaidBy(before, { mandatory: 50, wants: 30, savings: 20 }, "mandatory")).toBe("savings");
    expect(replanPaidBy(before, before, "mandatory")).toBeNull();
  });

  it("saves what was not spent and diffs plan against fact", () => {
    const fact = factFromSpending(100, { mandatory: 45, wants: 35 });
    expect(fact).toEqual({ mandatory: 45, wants: 35, savings: 20 });
    expect(planFactDiff({ mandatory: 40, wants: 30, savings: 30 }, fact)).toEqual({ mandatory: 5, wants: 5, savings: -10 });
  });

  it("counts rounds to a goal", () => {
    expect(roundsToGoal(30, 100, 10)).toBe(7);
    expect(roundsToGoal(100, 100, 10)).toBe(0);
    expect(roundsToGoal(0, 10, 0)).toBeNull();
  });
});
