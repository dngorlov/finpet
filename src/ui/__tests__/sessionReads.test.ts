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
    expect(ports.game.claimTaskReward(profileId, day.dayId, "budget_what", 10)).toBe(10);

    const closed = closeScoredDay(ports, profileId);
    expect(closed).toMatchObject({
      n: 1,
      score: 4,
      facts: { mandatoryCovered: true, withinPlan: true, deposited: true },
      meterDeltas: { care: -15, mood: -15 },
      stage: "novice",
      previousStage: "novice",
    });
    expect(closed.stageExplanation).toBeNull();
    expect(ports.game.lastClosedDay(profileId)).toEqual(closed);
    expect(ports.game.dayState(profileId)).toMatchObject({ open: false, n: 1, dayId: closed.dayId });
    expect(ports.game.listTaskProgress(profileId)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ taskKey: "budget_fix_backpack", status: "available", rewardPaid: false, bestReward: 0 }),
        expect.objectContaining({ taskKey: "budget_what", status: "completed", rewardPaid: true, bestReward: 10 }),
      ]),
    );
  });

  it("opens the next Игровой день right after close for a child and for Демо-режим", () => {
    const childPorts = createFakePorts();
    const childId = seedReturningChild(childPorts);
    closeScoredDay(childPorts, childId);
    expect(childPorts.game.openDay(childId)).toMatchObject({ status: "opened", n: 2 });

    const demoPorts = createFakePorts();
    const demoId = seedReturningChild(demoPorts, { isDemo: true, name: "Демо", petName: "Демо" });
    closeScoredDay(demoPorts, demoId);
    expect(demoPorts.game.openDay(demoId)).toMatchObject({
      status: "opened",
      n: 2,
    });
    expect(demoPorts.game.dayState(demoId).open).toBe(true);
  });

  it("lets task step and reward write against the last closed day while waiting", () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const closed = closeScoredDay(ports, profileId);
    expect(ports.game.dayState(profileId)).toMatchObject({ open: false, dayId: closed.dayId });

    expect(() => ports.game.purchase(profileId, closed.dayId, lunch)).toThrow();

    ports.game.applyTaskStep(profileId, closed.dayId, {
      next: "exit",
      verdict: "good",
      explanation: "replay",
      effects: [],
      spawnTask: "budget_fix_backpack",
    });
    expect(ports.game.claimTaskReward(profileId, closed.dayId, "budget_what", 10)).toBe(10);
  });
});
