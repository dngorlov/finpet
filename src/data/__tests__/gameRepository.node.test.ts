import { ManualClock, nextDayUnlocked } from "../../core/clock";
import type { Clock } from "../../core/clock";
import type { CatalogItem } from "../../core/economy";
import { META_KEYS } from "../metaKeys";
import { openMemoryGame } from "../testSupport/memoryDb";

const GOALS = [
  { key: "skateboard", cost: 90 },
  { key: "telescope", cost: 160 },
  { key: "bike", cost: 240 },
] as const;

const lunch: CatalogItem = {
  id: "lunch",
  kind: "mandatory",
  price: 12,
  effect: { meter: "care", delta: 10 },
};
const toy: CatalogItem = {
  id: "toy",
  kind: "optional",
  price: 25,
  effect: { meter: "mood", delta: 10 },
};
const candy: CatalogItem = {
  id: "candy",
  kind: "optional",
  price: 5,
  effect: { meter: "mood", delta: 5 },
};

const tinyCatalog: CatalogItem[] = [lunch, toy, candy];

class FakeClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  set(next: Date): void {
    this.current = next;
  }
  isNextDayUnlocked(lastClosedAt: Date, isDemo: boolean): boolean {
    return nextDayUnlocked(this.now(), lastClosedAt, isDemo);
  }
}

function seed(clock?: Clock) {
  const env = openMemoryGame(clock);
  const profileId = env.game.createProfile({
    name: "Миша",
    species: "sp1",
    color: "c1",
    accessory: "a1",
    petName: "Пух",
    contentVersion: 1,
    goals: GOALS,
    activeGoalKey: "skateboard",
  });
  return { ...env, profileId };
}

function sums(sqlite: import("better-sqlite3").Database, profileId: string) {
  const balance = sqlite.prepare("SELECT balance FROM profiles WHERE id = ?").get(profileId) as {
    balance: number;
  };
  const tx = sqlite
    .prepare("SELECT COALESCE(SUM(amount), 0) AS total FROM transactions WHERE profileId = ?")
    .get(profileId) as { total: number };
  const pot = sqlite
    .prepare(
      `SELECT COALESCE(SUM(CASE kind WHEN 'in' THEN amount ELSE -amount END), 0) AS pot
       FROM savingsTransfers WHERE profileId = ?`,
    )
    .get(profileId) as { pot: number };
  return { balance: balance.balance, txSum: tx.total, pot: pot.pot };
}

describe("grants and the balance invariant", () => {
  it("creates a Профиль ребёнка when the runtime has no global crypto", () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: undefined });
    try {
      const { game } = openMemoryGame();
      const profileId = game.createProfile({
        name: "Миша",
        species: "sp1",
        color: "c1",
        accessory: "a1",
        petName: "Пух",
        contentVersion: 1,
        goals: GOALS,
        activeGoalKey: "skateboard",
      });

      expect(game.getProfile(profileId).petName).toBe("Пух");
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "crypto", descriptor);
      } else {
        delete (globalThis as { crypto?: Crypto }).crypto;
      }
    }
  });

  it("completes Первый запуск atomically and is idempotent for the same profile id", () => {
    const { game, meta, sqlite } = openMemoryGame();
    const input = {
      id: "first-run-profile",
      name: "Миша",
      species: "sp2",
      color: "c1",
      accessory: "a1",
      petName: "Пух",
      contentVersion: 1,
      goals: GOALS,
      activeGoalKey: "skateboard",
    };

    expect(game.completeFirstRun(input)).toBe(input.id);
    expect(game.completeFirstRun(input)).toBe(input.id);
    expect(meta.get(META_KEYS.activeProfileId)).toBe(input.id);
    expect(meta.get(META_KEYS.onboardingDone)).toBe("1");
    expect(sums(sqlite, input.id)).toEqual({ balance: 100, txSum: 100, pot: 0 });
    expect(
      sqlite.prepare("SELECT COUNT(*) AS count FROM profiles WHERE id = ?").get(input.id),
    ).toEqual({ count: 1 });
  });

  it("rolls back the profile and Стартовый бюджет when activation fails", () => {
    const { game, sqlite } = openMemoryGame();
    sqlite.exec(`
      CREATE TRIGGER fail_first_run_activation
      BEFORE INSERT ON meta
      WHEN NEW.key = 'activeProfileId'
      BEGIN
        SELECT RAISE(ABORT, 'activation failed');
      END;
    `);

    const input = {
      id: "rolled-back-profile",
      name: "Миша",
      species: "sp1",
      color: "c1",
      accessory: "a1",
      petName: "Пух",
      contentVersion: 1,
      goals: GOALS,
      activeGoalKey: "skateboard",
    };

    expect(() => game.completeFirstRun(input)).toThrow("activation failed");
    expect(
      sqlite.prepare("SELECT COUNT(*) AS count FROM profiles WHERE id = ?").get("rolled-back-profile"),
    ).toEqual({ count: 0 });
    expect(
      sqlite
        .prepare("SELECT COUNT(*) AS count FROM transactions WHERE profileId = ?")
        .get("rolled-back-profile"),
    ).toEqual({ count: 0 });

    sqlite.exec("DROP TRIGGER fail_first_run_activation");
    expect(game.completeFirstRun(input)).toBe(input.id);
    expect(sums(sqlite, input.id)).toEqual({ balance: 100, txSum: 100, pot: 0 });
  });

  it("grants 100 at profile creation and +10 Пособие on first open of a day", () => {
    const { game, sqlite, profileId } = seed();

    expect(game.getProfile(profileId)).toMatchObject({
      balance: 100,
      species: "sp1",
      color: "c1",
      accessory: "a1",
      petName: "Пух",
      name: "Миша",
    });
    expect(sums(sqlite, profileId)).toEqual({ balance: 100, txSum: 100, pot: 0 });

    const day = game.openDay(profileId);
    expect(day).toMatchObject({ status: "opened", n: 1, allowanceCredited: true });
    expect(game.getProfile(profileId).balance).toBe(110);
    expect(sums(sqlite, profileId).txSum).toBe(110);

    const again = game.openDay(profileId);
    expect(again).toMatchObject({ status: "opened", n: 1, allowanceCredited: false });
    expect(game.getProfile(profileId).balance).toBe(110);
  });
});

describe("plan validation", () => {
  it("lets a draft change and locks the plan after confirm; confirm is blocked when buckets exceed the balance", () => {
    const { game, sqlite, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");
    const { dayId } = opened;

    game.saveDraftPlan(profileId, dayId, { mandatory: 12, optional: 5, savings: 10 });
    game.saveDraftPlan(profileId, dayId, { mandatory: 12, optional: 8, savings: 10 });

    const over = game.saveDraftPlan(profileId, dayId, { mandatory: 80, optional: 80, savings: 80 });
    expect(over).toBeUndefined();
    expect(game.confirmPlan(profileId, dayId)).toEqual({ ok: false, remainder: -130 });

    game.saveDraftPlan(profileId, dayId, { mandatory: 12, optional: 8, savings: 10 });
    expect(game.confirmPlan(profileId, dayId)).toEqual({ ok: true });

    expect(() =>
      game.saveDraftPlan(profileId, dayId, { mandatory: 12, optional: 0, savings: 0 }),
    ).toThrow(/подтверждён/);

    const plan = sqlite.prepare("SELECT status, mandatory FROM plans WHERE dayId = ?").get(dayId) as {
      status: string;
      mandatory: number;
    };
    expect(plan).toEqual({ status: "confirmed", mandatory: 12 });
  });
});

describe("debit", () => {
  it("writes the purchase and history, raises Забота, and refuses an over-balance buy", () => {
    const { game, sqlite, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");

    expect(game.purchase(profileId, opened.dayId, lunch)).toEqual({ status: "ok" });
    expect(game.getProfile(profileId)).toMatchObject({ balance: 98, care: 60 });
    expect(sums(sqlite, profileId)).toMatchObject({ balance: 98, txSum: 98 });

    const purchase = sqlite
      .prepare("SELECT itemId, price FROM purchases WHERE profileId = ?")
      .get(profileId) as { itemId: string; price: number };
    expect(purchase).toEqual({ itemId: "lunch", price: 12 });

    const event = sqlite
      .prepare("SELECT meter, delta, source FROM meterEvents WHERE profileId = ?")
      .get(profileId) as { meter: string; delta: number; source: string };
    expect(event).toEqual({ meter: "care", delta: 10, source: "purchase:lunch" });

    const cheap: CatalogItem = { ...toy, price: 200 };
    expect(game.purchase(profileId, opened.dayId, cheap)).toEqual({ status: "blocked", missing: 102 });
    expect(game.getProfile(profileId).balance).toBe(98);
    expect(game.getProfile(profileId).balance).toBeGreaterThanOrEqual(0);
  });
});

describe("savings", () => {
  it("deposits and withdrawals keep the pot ≥ 0, complete a goal at cost, and show «—» before the first transfer", () => {
    const { game, sqlite, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");
    const { dayId } = opened;

    expect(game.savingsState(profileId).estimateDays).toBeNull();

    expect(game.transferToSavings(profileId, dayId, 15)).toEqual({ status: "ok", achieved: false });
    expect(game.savingsState(profileId)).toMatchObject({
      pot: 15,
      estimateDays: 5,
      activeGoal: { key: "skateboard", remaining: 75 },
    });

    expect(game.withdrawFromSavings(profileId, dayId, 5)).toEqual({ ok: true, potAfter: 10 });
    expect(game.withdrawFromSavings(profileId, dayId, 40)).toEqual({ ok: false, potAfter: -30 });
    expect(sums(sqlite, profileId).pot).toBe(10);
    expect(sums(sqlite, profileId).balance).toBe(sums(sqlite, profileId).txSum);

    const attributed = sqlite
      .prepare("SELECT goalId FROM transactions WHERE kind = 'savings_in' AND profileId = ?")
      .get(profileId) as { goalId: string };
    expect(attributed.goalId).toBe("skateboard");

    expect(game.transferToSavings(profileId, dayId, 80)).toMatchObject({ status: "ok", achieved: true });
    const state = game.savingsState(profileId);
    expect(state.pot).toBe(0);
    expect(state.activeGoal).toBeNull();
    expect(game.getProfile(profileId).mood).toBe(60);

    game.setActiveGoal(profileId, "telescope");
    expect(game.savingsState(profileId).activeGoal).toMatchObject({ key: "telescope", remaining: 160 });

    const goal = sqlite
      .prepare("SELECT status, isActive FROM goals WHERE profileId = ? AND key = 'skateboard'")
      .get(profileId) as { status: string; isActive: number };
    expect(goal).toEqual({ status: "achieved", isActive: 0 });
  });
});

function playScoredDay(game: ReturnType<typeof seed>["game"], profileId: string) {
  const opened = game.openDay(profileId);
  if (opened.status !== "opened") throw new Error("expected opened");
  game.saveDraftPlan(profileId, opened.dayId, { mandatory: 12, optional: 5, savings: 15 });
  game.confirmPlan(profileId, opened.dayId);
  game.purchase(profileId, opened.dayId, lunch);
  game.purchase(profileId, opened.dayId, candy);
  game.transferToSavings(profileId, opened.dayId, 15);
  return game.closeDay(profileId, tinyCatalog);
}

describe("stages", () => {
  it("scores +2/+1/+1, rolls the last 3 days, crosses 3 then 9, and explains each change", () => {
    const { game, profileId } = seed();

    const close1 = playScoredDay(game, profileId);
    expect(close1.score).toBe(4);
    expect(close1.stage).toBe("friend");
    expect(close1.stageExplanation).toMatch(/Друг/);

    const close2 = playScoredDay(game, profileId);
    expect(close2.stage).toBe("friend");
    expect(close2.stageExplanation).toBeNull();

    const close3 = playScoredDay(game, profileId);
    expect(close3.stage).toBe("master");
    expect(close3.stageExplanation).toMatch(/Мастер/);
  });
});

describe("day gating", () => {
  it("unlocks the next calendar day through a fake Clock and stays locked before midnight", () => {
    const clock = new FakeClock(new Date(2026, 8, 19, 18, 0, 0));
    const { game, profileId } = seed(clock);

    const first = game.openDay(profileId);
    if (first.status !== "opened") throw new Error("expected opened");
    game.closeDay(profileId, tinyCatalog);

    expect(game.openDay(profileId)).toEqual({ status: "blocked" });

    clock.set(new Date(2026, 8, 20, 0, 0, 0));
    expect(game.openDay(profileId)).toMatchObject({ status: "opened", n: 2, allowanceCredited: true });
  });

  it("opens days back-to-back under a ManualClock", () => {
    const clock = new ManualClock(new Date(2026, 8, 19, 12, 0, 0));
    const { game, profileId } = seed(clock);

    const ids = [];
    for (let n = 1; n <= 5; n += 1) {
      const opened = game.openDay(profileId);
      if (opened.status !== "opened") throw new Error(`day ${n} blocked`);
      ids.push(opened.n);
      game.closeDay(profileId, tinyCatalog);
    }
    expect(ids).toEqual([1, 2, 3, 4, 5]);
  });
});

describe("task reward", () => {
  it("pays +10 only on the first correct completion", () => {
    const { game, sqlite, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");

    expect(game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", false)).toBe(0);
    expect(game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", true)).toBe(10);
    expect(game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", true)).toBe(0);
    expect(game.getProfile(profileId).balance).toBe(120);
    expect(sums(sqlite, profileId).balance).toBe(sums(sqlite, profileId).txSum);
  });

  it("applies option effects, scene coins, and spawned correction tasks", () => {
    const { game, sqlite, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");

    game.applyTaskStep(profileId, opened.dayId, {
      next: "exit",
      verdict: "bad",
      explanation: "исправить",
      effects: [
        { meter: "mood", delta: 5 },
        { meter: "care", delta: -15 },
        { coins: 2 },
      ],
      spawnTask: "budget_fix_backpack",
    });

    expect(game.getProfile(profileId)).toMatchObject({ mood: 55, care: 35, balance: 112 });
    const spawned = sqlite
      .prepare("SELECT status FROM taskProgress WHERE taskKey = 'budget_fix_backpack'")
      .get() as { status: string };
    expect(spawned.status).toBe("available");
  });

  it("lets task step and reward write against the last closed day while waiting", () => {
    const { game, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");
    game.closeDay(profileId, tinyCatalog);
    expect(game.dayState(profileId)).toMatchObject({ open: false, dayId: opened.dayId });

    expect(() => game.purchase(profileId, opened.dayId, lunch)).toThrow(/уже закрыт/);

    game.applyTaskStep(profileId, opened.dayId, {
      next: "exit",
      verdict: "good",
      explanation: "replay",
      effects: [],
      spawnTask: "budget_fix_backpack",
    });
    expect(game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", true)).toBe(10);
    expect(game.listTaskProgress(profileId)).toEqual(
      expect.arrayContaining([
        { taskKey: "budget_fix_backpack", status: "available", rewardPaid: false },
        { taskKey: "budget_first_plan", status: "completed", rewardPaid: true },
      ]),
    );
  });
});

describe("schema roundtrip", () => {
  it("stores profile, purchases, savings, goal and task progress as real SQL rows", () => {
    const { game, sqlite, profileId, meta } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");
    game.purchase(profileId, opened.dayId, lunch);
    game.transferToSavings(profileId, opened.dayId, 15);
    game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", true);
    meta.set("activeProfileId", profileId);

    const tables = sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[];
    expect(tables.map((t) => t.name)).toEqual(
      expect.arrayContaining([
        "profiles",
        "days",
        "plans",
        "transactions",
        "purchases",
        "savingsTransfers",
        "goals",
        "petState",
        "meterEvents",
        "dayScores",
        "taskProgress",
        "meta",
      ]),
    );
    expect(meta.get("activeProfileId")).toBe(profileId);
    expect(sums(sqlite, profileId).balance).toBe(sums(sqlite, profileId).txSum);
  });
});

describe("Удалить профиль", () => {
  it("removes that Профиль ребёнка and leaves a Демо-режим profile", () => {
    const { game } = openMemoryGame();
    const childId = game.createProfile({
      name: "Миша",
      species: "sp1",
      color: "c1",
      accessory: "a1",
      petName: "Пух",
      contentVersion: 1,
      goals: GOALS,
      activeGoalKey: "skateboard",
    });
    const opened = game.openDay(childId);
    if (opened.status !== "opened") throw new Error("expected opened");
    game.purchase(childId, opened.dayId, lunch);
    game.transferToSavings(childId, opened.dayId, 15);
    game.claimTaskReward(childId, opened.dayId, "budget_first_plan", true);

    const demoId = game.createProfile({
      name: "Демо",
      species: "sp2",
      color: "c2",
      accessory: "a2",
      petName: "Демо",
      isDemo: true,
      contentVersion: 1,
      goals: GOALS,
      activeGoalKey: "skateboard",
    });
    game.openDay(demoId);

    game.deleteProfile(childId);

    expect(() => game.getProfile(childId)).toThrow(/не найден/);
    expect(game.getProfile(demoId)).toMatchObject({ name: "Демо", isDemo: true, petName: "Демо" });
  });
});

describe("day and journal reads", () => {
  it("returns dayState, journal, goals, and today's purchased ids", () => {
    const { game, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");

    expect(game.dayState(profileId)).toMatchObject({
      dayId: opened.dayId,
      n: 1,
      open: true,
      plan: { status: "none", buckets: { mandatory: 0, optional: 0, savings: 0 } },
      available: 110,
      actual: { mandatory: 0, optional: 0, savings: 0 },
    });

    game.saveDraftPlan(profileId, opened.dayId, { mandatory: 12, optional: 5, savings: 10 });
    expect(game.confirmPlan(profileId, opened.dayId)).toEqual({ ok: true });
    expect(game.purchase(profileId, opened.dayId, lunch)).toEqual({ status: "ok" });
    expect(game.transferToSavings(profileId, opened.dayId, 15)).toEqual({ status: "ok", achieved: false });

    expect(game.dayState(profileId)).toMatchObject({
      plan: { status: "confirmed", buckets: { mandatory: 12, optional: 5, savings: 10 } },
      available: 83,
      actual: { mandatory: 12, optional: 0, savings: 15 },
    });
    expect(game.purchasedItemIds(profileId, opened.dayId)).toEqual(["lunch"]);
    expect(game.listGoals(profileId)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "skateboard", isActive: true, status: "active" }),
        expect.objectContaining({ key: "telescope", isActive: false }),
      ]),
    );

    const journal = game.listJournal(profileId);
    expect(journal).toHaveLength(4);
    expect(journal.map((row) => row.labelKey)).toEqual(
      expect.arrayContaining(["savings_in", "purchase:lunch", "allowance", "starting_grant"]),
    );
    expect(journal.find((row) => row.labelKey === "savings_in")).toMatchObject({
      dayN: 1,
      amount: -15,
      kind: "savings_in",
    });
    expect(journal.find((row) => row.labelKey === "starting_grant")).toMatchObject({
      dayN: 0,
      amount: 100,
    });
  });

  it("returns an expanded day summary from closeDay and lastClosedDay", () => {
    const { game, profileId } = seed();

    expect(game.lastClosedDay(profileId)).toBeNull();
    expect(game.listTaskProgress(profileId)).toEqual([]);

    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");
    const closed = playScoredDay(game, profileId);

    expect(closed).toMatchObject({
      dayId: opened.dayId,
      n: 1,
      score: 4,
      facts: { mandatoryCovered: true, withinPlan: true, deposited: true },
      plan: { mandatory: 12, optional: 5, savings: 15 },
      actual: { mandatory: 12, optional: 5, savings: 15 },
      meterDeltas: { care: 0, mood: 0 },
      stage: "friend",
      previousStage: "novice",
    });
    expect(closed.stageExplanation).toMatch(/Друг/);
    expect(game.lastClosedDay(profileId)).toEqual(closed);
    expect(game.dayState(profileId)).toMatchObject({
      open: false,
      dayId: opened.dayId,
      n: 1,
      plan: { status: "confirmed", buckets: { mandatory: 12, optional: 5, savings: 15 } },
      actual: { mandatory: 12, optional: 5, savings: 15 },
    });
  });

  it("lists task progress after a spawn and a first reward", () => {
    const { game, profileId } = seed();
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("expected opened");

    game.applyTaskStep(profileId, opened.dayId, {
      next: "exit",
      verdict: "bad",
      explanation: "исправить",
      effects: [],
      spawnTask: "budget_fix_backpack",
    });
    expect(game.claimTaskReward(profileId, opened.dayId, "budget_first_plan", true)).toBe(10);

    expect(game.listTaskProgress(profileId)).toEqual(
      expect.arrayContaining([
        { taskKey: "budget_fix_backpack", status: "available", rewardPaid: false },
        { taskKey: "budget_first_plan", status: "completed", rewardPaid: true },
      ]),
    );
  });
});
