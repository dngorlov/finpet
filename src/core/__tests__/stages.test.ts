import { dayScore, explainStageChange, stageFromScores } from "../stages";

describe("dayScore", () => {
  it("is +2 all mandatory bought, +1 spend within plan, +1 deposit made", () => {
    expect(
      dayScore({ mandatoryCovered: true, withinPlan: true, deposited: true }),
    ).toBe(4);
    expect(
      dayScore({ mandatoryCovered: true, withinPlan: false, deposited: false }),
    ).toBe(2);
    expect(
      dayScore({ mandatoryCovered: false, withinPlan: true, deposited: true }),
    ).toBe(2);
    expect(
      dayScore({ mandatoryCovered: false, withinPlan: false, deposited: false }),
    ).toBe(0);
  });
});

describe("stageFromScores", () => {
  it("is Новичок while the last-3 rolling sum is below 3", () => {
    expect(stageFromScores([])).toBe("novice");
    expect(stageFromScores([2, 0])).toBe("novice");
  });

  it("is Друг at 3–8 over the last 3 closed days", () => {
    expect(stageFromScores([1, 1, 1])).toBe("friend");
    expect(stageFromScores([4, 4, 0])).toBe("friend");
    expect(stageFromScores([4, 4, 4, 0])).toBe("friend");
  });

  it("is Мастер at 9 or more over the last 3 closed days", () => {
    expect(stageFromScores([4, 4, 1])).toBe("master");
    expect(stageFromScores([0, 0, 0, 4, 4, 4])).toBe("master");
  });
});

describe("explainStageChange", () => {
  it("emits a kid-worded explanation only when the stage actually changes", () => {
    expect(explainStageChange("novice", "novice")).toBeNull();
    expect(explainStageChange("novice", "friend")).toMatch(/Друг/);
    expect(explainStageChange("friend", "master")).toMatch(/Мастер/);
    expect(explainStageChange("friend", "novice")).toMatch(/Новичок/);
  });
});
