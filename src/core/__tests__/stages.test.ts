import { explainStageChange, nextStage, stageFromCode } from "../stages";

describe("Этап", () => {
  it("moves one step when the Цель is bought, and stays at Миллионер", () => {
    expect(nextStage("novice")).toBe("pro");
    expect(nextStage("pro")).toBe("millionaire");
    expect(nextStage("millionaire")).toBe("millionaire");
  });

  it("names the new Этап, and says nothing when it did not move", () => {
    expect(explainStageChange("novice", "novice")).toBeNull();
    expect(explainStageChange("novice", "pro")).toBe("Теперь ты Про!");
    expect(explainStageChange("pro", "millionaire")).toBe("Теперь ты Миллионер!");
    expect(explainStageChange("millionaire", "millionaire")).toBeNull();
  });

  it("reads the stored code", () => {
    expect(stageFromCode(0)).toBe("novice");
    expect(stageFromCode(1)).toBe("pro");
    expect(stageFromCode(2)).toBe("millionaire");
  });
});
