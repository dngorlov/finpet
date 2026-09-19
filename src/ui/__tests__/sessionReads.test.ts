import type { CatalogItem } from "../../core/economy";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const lunch: CatalogItem = {
  id: "lunch",
  kind: "mandatory",
  price: 12,
  effect: { meter: "care", delta: 10 },
};
const candy: CatalogItem = {
  id: "candy",
  kind: "optional",
  price: 5,
  effect: { meter: "mood", delta: 5 },
};
const tinyCatalog: CatalogItem[] = [lunch, candy];

function closeScoredDay(ports: ReturnType<typeof createFakePorts>, profileId: string) {
  const day = ports.game.dayState(profileId);
  ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 12, optional: 5, savings: 15 });
  ports.game.confirmPlan(profileId, day.dayId);
  ports.game.purchase(profileId, day.dayId, lunch);
  ports.game.purchase(profileId, day.dayId, candy);
  ports.game.transferToSavings(profileId, day.dayId, 15);
  return ports.game.closeDay(profileId, tinyCatalog);
}

describe("fake SessionGame M4 reads", () => {
  it("exposes lastClosedDay, listTaskProgress, and dayState.open", () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);

    expect(ports.game.lastClosedDay(profileId)).toBeNull();
    expect(ports.game.listTaskProgress(profileId)).toEqual([]);
    expect(ports.game.dayState(profileId).open).toBe(true);

    const day = ports.game.dayState(profileId);
    ports.game.applyTaskStep(profileId, day.dayId, {
      next: "exit",
      verdict: "bad",
      explanation: "исправить",
      effects: [],
      spawnTask: "budget_fix_backpack",
    });
    expect(ports.game.claimTaskReward(profileId, day.dayId, "budget_first_plan", true)).toBe(10);

    const closed = closeScoredDay(ports, profileId);
    expect(closed).toMatchObject({
      n: 1,
      score: 4,
      facts: { mandatoryCovered: true, withinPlan: true, deposited: true },
      meterDeltas: { care: 0, mood: 0 },
      stage: "friend",
      previousStage: "novice",
    });
    expect(closed.stageExplanation).toMatch(/Друг/);
    expect(ports.game.lastClosedDay(profileId)).toEqual(closed);
    expect(ports.game.dayState(profileId)).toMatchObject({ open: false, n: 1, dayId: closed.dayId });
    expect(ports.game.listTaskProgress(profileId)).toEqual(
      expect.arrayContaining([
        { taskKey: "budget_fix_backpack", status: "available", rewardPaid: false },
        { taskKey: "budget_first_plan", status: "completed", rewardPaid: true },
      ]),
    );
  });

  it("blocks the next open after close for a child and stays back-to-back in Демо-режим", () => {
    const childPorts = createFakePorts();
    const childId = seedReturningChild(childPorts);
    closeScoredDay(childPorts, childId);
    expect(childPorts.game.openDay(childId)).toEqual({ status: "blocked" });

    const demoPorts = createFakePorts();
    const demoId = seedReturningChild(demoPorts, { isDemo: true, name: "Демо", petName: "Демо" });
    closeScoredDay(demoPorts, demoId);
    expect(demoPorts.game.openDay(demoId)).toMatchObject({
      status: "opened",
      n: 2,
      allowanceCredited: true,
    });
    expect(demoPorts.game.dayState(demoId).open).toBe(true);
  });
});
