import { readCustomGoalItem, customGoalItemId, parseCustomGoalDraft } from "../customGoal";
import { applyStageStep, explainStageChange, nextStage, showStageThreshold, stageFromCode, stageGoalFloor } from "../stages";

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

  it("uses the cheapest preset as the Порог этапа", () => {
    expect(stageGoalFloor([90, 60, 75])).toBe(60);
    expect(() => stageGoalFloor([])).toThrow(/этап/);
  });

  it("advances on a preset or a Своя цель at the Порог, and sums cheaper ones", () => {
    expect(
      applyStageStep({ stage: "novice", custom: false, price: 90, threshold: 60, credit: 20 }),
    ).toEqual({ stage: "pro", credit: 0 });
    expect(
      applyStageStep({ stage: "novice", custom: true, price: 60, threshold: 60, credit: 40 }),
    ).toEqual({ stage: "pro", credit: 0 });
    expect(
      applyStageStep({ stage: "novice", custom: true, price: 20, threshold: 60, credit: 0 }),
    ).toEqual({ stage: "novice", credit: 20 });
    expect(
      applyStageStep({ stage: "novice", custom: true, price: 20, threshold: 60, credit: 40 }),
    ).toEqual({ stage: "pro", credit: 0 });
    expect(
      applyStageStep({ stage: "millionaire", custom: true, price: 10, threshold: 220, credit: 0 }),
    ).toEqual({ stage: "millionaire", credit: 0 });
  });

  it("shows the Порог only for a cheaper Своя цель when a next Этап exists", () => {
    expect(showStageThreshold({ stage: "novice", custom: true, price: 59, threshold: 60 })).toBe(true);
    expect(showStageThreshold({ stage: "novice", custom: true, price: 60, threshold: 60 })).toBe(false);
    expect(showStageThreshold({ stage: "novice", custom: false, price: 20, threshold: 60 })).toBe(false);
    expect(showStageThreshold({ stage: "millionaire", custom: true, price: 10, threshold: 220 })).toBe(false);
  });
});

describe("Своя цель", () => {
  it("keeps a trimmed name and rejects an empty one or a price outside 1…999", () => {
    expect(parseCustomGoalDraft({ name: "  Мяч ", icon: "⚽", price: 20 })).toEqual({
      name: "Мяч",
      icon: "⚽",
      price: 20,
    });
    expect(() => parseCustomGoalDraft({ name: "   ", icon: "⚽", price: 20 })).toThrow(/Название/);
    expect(() => parseCustomGoalDraft({ name: "Мяч", icon: "⚽", price: 0 })).toThrow(/Цена/);
  });

  it("round-trips the name and price through the item id", () => {
    const id = customGoalItemId("cg_1", 20, "Наклейки");
    expect(readCustomGoalItem(id)).toEqual({ id: "cg_1", price: 20, name: "Наклейки" });
    expect(readCustomGoalItem("skateboard")).toBeNull();
  });
});
