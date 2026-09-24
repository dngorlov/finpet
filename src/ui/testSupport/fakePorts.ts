import { ECONOMY, METERS } from "../../core/config";
import {
  applyMeterDelta,
  billsForDay,
  checkPurchase,
  dayCloseMeterDeltas,
  planKept,
  validatePlan,
  type CatalogItem,
  type PlanBuckets,
} from "../../core/economy";
import { applyGoalProgress, checkWithdrawal, estimateDaysToGoal, potFromTransfers } from "../../core/savings";
import { dayScore, explainStageChange, stageFromScores } from "../../core/stages";
import { rewardTopUp, type TaskStepResult } from "../../core/tasks";
import { loadContent } from "../../data/content";
import { META_KEYS } from "../../data/metaKeys";
import type {
  CreateProfileInput,
  DayState,
  DaySummaryView,
  GoalOption,
  JournalEntry,
  ProfileView,
  TaskProgressView,
} from "../../data/repositories/gameRepository";
import type { SessionPorts } from "../session/types";

type TransferRow = { dayId: string; amount: number; kind: "in" | "out" };
type PurchaseRow = {
  dayId: string;
  itemId: string;
  price: number;
  kind: "mandatory" | "optional";
  paidFrom: "balance" | "savings";
  boughtAsActiveGoal: boolean;
};
type StoredGoal = GoalOption & { fundedCelebrated: boolean };

type StoredProfile = ProfileView & {
  dayOpen: boolean;
  dayId: string;
  dayN: number;
  goals: StoredGoal[];
  planStatus: DayState["plan"]["status"];
  buckets: PlanBuckets;
  journal: JournalEntry[];
  purchases: PurchaseRow[];
  transfers: TransferRow[];
  scores: number[];
  lastClosed: DaySummaryView | null;
  tasks: TaskProgressView[];
};

function viewOf(row: StoredProfile): ProfileView {
  const {
    dayOpen: _dayOpen,
    dayId: _dayId,
    dayN: _dayN,
    goals: _goals,
    planStatus: _planStatus,
    buckets: _buckets,
    journal: _journal,
    purchases: _purchases,
    transfers: _transfers,
    scores: _scores,
    lastClosed: _lastClosed,
    tasks: _tasks,
    ...view
  } = row;
  return view;
}

function requireRow(profiles: Map<string, StoredProfile>, profileId: string): StoredProfile {
  const row = profiles.get(profileId);
  if (!row) throw new Error(`Профиль ${profileId} не найден`);
  return row;
}

function requireOpen(row: StoredProfile, dayId: string): void {
  if (!row.dayOpen || row.dayId !== dayId) throw new Error("Игровой день не найден");
}

function requireDayForTask(row: StoredProfile, dayId: string): void {
  if (row.dayId !== dayId) throw new Error("Игровой день не найден");
}

function appendJournal(
  row: StoredProfile,
  input: {
    amount: number;
    kind: string;
    labelKey: string;
    itemId?: string | null;
    goalId?: string | null;
    dayN?: number;
  },
): void {
  row.journal.unshift({
    id: `tx_${row.journal.length + 1}`,
    dayN: input.dayN ?? (row.dayOpen ? row.dayN : 0),
    createdAt: row.journal.length + 1,
    amount: input.amount,
    kind: input.kind,
    labelKey: input.labelKey,
    itemId: input.itemId ?? null,
    goalId: input.goalId ?? null,
  });
}

function emptyBuckets(): PlanBuckets {
  return { mandatory: 0, optional: 0, savings: 0 };
}

function actuals(row: StoredProfile): PlanBuckets {
  const today = row.purchases.filter((item) => item.dayId === row.dayId);
  const balancePaid = today.filter((item) => item.paidFrom !== "savings");
  return {
    mandatory: balancePaid.filter((item) => item.kind === "mandatory").reduce((sum, item) => sum + item.price, 0),
    optional: balancePaid.filter((item) => item.kind === "optional").reduce((sum, item) => sum + item.price, 0),
    savings: row.transfers
      .filter((item) => item.dayId === row.dayId && item.kind === "in")
      .reduce((sum, item) => sum + item.amount, 0),
  };
}

function ownsItem(row: StoredProfile, itemId: string): boolean {
  return row.purchases.some((item) => item.itemId === itemId);
}

function dayStateOf(row: StoredProfile): DayState {
  if (!row.dayOpen && !row.lastClosed) throw new Error("Нет открытого игрового дня");
  return {
    dayId: row.dayId,
    n: row.dayN,
    open: row.dayOpen,
    plan: { status: row.planStatus, buckets: { ...row.buckets } },
    available: row.balance,
    actual: actuals(row),
  };
}

/** In-memory game + meta adapters for jest-expo (no SQLite). */
export function createFakePorts(): SessionPorts {
  const meta = new Map<string, string>();
  const profiles = new Map<string, StoredProfile>();

  const createProfile = (input: CreateProfileInput) => {
    const id = input.id ?? `p_${profiles.size + 1}`;
    const row: StoredProfile = {
      id,
      name: input.name,
      petName: input.petName,
      species: input.species,
      color: input.color,
      accessory: input.accessory,
      balance: ECONOMY.startingBudget,
      isDemo: Boolean(input.isDemo),
      care: METERS.initialCare,
      mood: METERS.initialMood,
      stage: "novice",
      dayOpen: false,
      dayId: `${id}#1`,
      dayN: 1,
      goals: (() => {
        const seeded = input.goals.find((goal) => goal.key === input.activeGoalKey);
        return seeded
          ? [{ key: seeded.key, cost: seeded.cost, status: "active" as const, isActive: true, fundedCelebrated: false }]
          : [];
      })(),
      planStatus: "none",
      buckets: emptyBuckets(),
      journal: [],
      purchases: [],
      transfers: [],
      scores: [],
      lastClosed: null,
      tasks: [],
    };
    appendJournal(row, {
      amount: ECONOMY.startingBudget,
      kind: "starting_grant",
      labelKey: "starting_grant",
      dayN: 0,
    });
    profiles.set(id, row);
    return id;
  };

  return {
    content: loadContent(),
    firstRun: {
      complete(input) {
        if (
          input.id &&
          profiles.has(input.id) &&
          meta.get(META_KEYS.activeProfileId) === input.id &&
          meta.get(META_KEYS.onboardingDone) === "1"
        ) {
          return input.id;
        }
        const id = createProfile(input);
        meta.set(META_KEYS.activeProfileId, id);
        meta.set(META_KEYS.onboardingDone, "1");
        return id;
      },
    },
    meta: {
      get(key) {
        return meta.get(key) ?? null;
      },
      set(key, value) {
        meta.set(key, value);
      },
      remove(key) {
        meta.delete(key);
      },
    },
    game: {
      createProfile,
      getProfile(profileId) {
        return viewOf(requireRow(profiles, profileId));
      },
      deleteProfile(profileId) {
        if (!profiles.has(profileId)) throw new Error(`Профиль ${profileId} не найден`);
        profiles.delete(profileId);
      },
      openDay(profileId) {
        const row = requireRow(profiles, profileId);
        if (row.dayOpen) {
          return { status: "opened" as const, dayId: row.dayId, n: row.dayN, allowanceCredited: false };
        }
        if (row.lastClosed && !row.isDemo) {
          return { status: "blocked" as const };
        }
        if (row.lastClosed) {
          row.dayN += 1;
          row.planStatus = "none";
          row.buckets = emptyBuckets();
        }
        const dayId = `${profileId}#${row.dayN}`;
        row.dayOpen = true;
        row.dayId = dayId;
        row.balance += ECONOMY.allowance;
        appendJournal(row, {
          amount: ECONOMY.allowance,
          kind: "allowance",
          labelKey: "allowance",
        });
        return { status: "opened" as const, dayId, n: row.dayN, allowanceCredited: true };
      },
      savingsState(profileId) {
        const row = requireRow(profiles, profileId);
        const pot = potFromTransfers(row.transfers);
        const deposits = row.transfers.filter((t) => t.kind === "in").map((t) => t.amount);
        const active = row.goals.find((g) => g.isActive);
        if (!active) {
          return { pot, estimateDays: null, activeGoal: null };
        }
        const progress = applyGoalProgress(pot, active.cost);
        return {
          pot,
          estimateDays: estimateDaysToGoal(progress.remaining, deposits),
          activeGoal: {
            key: active.key,
            cost: active.cost,
            remaining: progress.remaining,
            achieved: progress.achieved,
          },
        };
      },
      dayState(profileId) {
        return dayStateOf(requireRow(profiles, profileId));
      },
      saveDraftPlan(profileId, dayId, buckets) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        if (buckets.mandatory < 0 || buckets.optional < 0 || buckets.savings < 0) {
          throw new Error("Суммы плана не могут быть отрицательными");
        }
        if (row.planStatus === "confirmed") throw new Error("План уже подтверждён");
        row.planStatus = "draft";
        row.buckets = { ...buckets };
      },
      confirmPlan(profileId, dayId, minMandatory = 0) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        if (row.planStatus === "none") throw new Error("Сначала составь план");
        if (row.planStatus === "confirmed") throw new Error("План уже подтверждён");
        const check = validatePlan(row.buckets, row.balance, Math.min(minMandatory, row.balance));
        if (!check.ok) return { ok: false as const, remainder: check.remainder };
        row.planStatus = "confirmed";
        return { ok: true as const };
      },
      purchase(profileId, dayId, item: CatalogItem) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        if (item.once && ownsItem(row, item.id)) return { status: "blocked" as const, missing: 0 };
        const check = checkPurchase(row.balance, item.price);
        if (check.status === "blocked") return check;
        const asActive = row.goals.some((goal) => goal.isActive && goal.key === item.id);
        row.balance -= item.price;
        row.purchases.push({
          dayId,
          itemId: item.id,
          price: item.price,
          kind: item.kind,
          paidFrom: "balance",
          boughtAsActiveGoal: asActive,
        });
        if (item.effect.meter === "care") {
          row.care = applyMeterDelta(row.care, item.effect.delta);
        } else {
          row.mood = applyMeterDelta(row.mood, item.effect.delta);
        }
        appendJournal(row, {
          amount: -item.price,
          kind: "purchase",
          labelKey: `purchase:${item.id}`,
          itemId: item.id,
        });
        if (asActive) row.goals = [];
        return { status: "ok" as const };
      },
      purchaseFromSavings(profileId, dayId, item: CatalogItem) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        const active = row.goals.find((goal) => goal.isActive);
        if (!active || active.key !== item.id) throw new Error("Купить из копилки можно только текущую Цель");
        if (item.once && ownsItem(row, item.id)) return { status: "blocked" as const, missing: 0 };
        const pot = potFromTransfers(row.transfers);
        if (pot < item.price) return { status: "blocked" as const, missing: item.price - pot };
        row.transfers.push({ dayId, amount: item.price, kind: "out" });
        row.purchases.push({
          dayId,
          itemId: item.id,
          price: item.price,
          kind: item.kind,
          paidFrom: "savings",
          boughtAsActiveGoal: true,
        });
        if (item.effect.meter === "care") {
          row.care = applyMeterDelta(row.care, item.effect.delta);
        } else {
          row.mood = applyMeterDelta(row.mood, item.effect.delta);
        }
        appendJournal(row, {
          amount: 0,
          kind: "purchase",
          labelKey: `purchase:${item.id}`,
          itemId: item.id,
          goalId: item.id,
        });
        row.goals = [];
        return { status: "ok" as const };
      },
      transferToSavings(profileId, dayId, amount) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        if (amount <= 0) throw new Error("Сумма должна быть больше нуля");
        const check = checkPurchase(row.balance, amount);
        if (check.status === "blocked") return check;
        const active = row.goals.find((g) => g.isActive);
        row.balance -= amount;
        row.transfers.push({ dayId, amount, kind: "in" });
        appendJournal(row, {
          amount: -amount,
          kind: "savings_in",
          labelKey: "savings_in",
          goalId: active?.key,
        });
        const pot = potFromTransfers(row.transfers);
        let achieved = false;
        if (active) {
          const progress = applyGoalProgress(pot, active.cost);
          if (progress.achieved && !active.fundedCelebrated) {
            achieved = true;
            active.fundedCelebrated = true;
          }
        }
        return { status: "ok" as const, achieved };
      },
      withdrawFromSavings(profileId, dayId, amount) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        const pot = potFromTransfers(row.transfers);
        const check = checkWithdrawal(pot, amount);
        if (!check.ok) return { ok: false as const, potAfter: check.potAfter };
        row.balance += amount;
        row.transfers.push({ dayId, amount, kind: "out" });
        appendJournal(row, {
          amount,
          kind: "savings_out",
          labelKey: "savings_out",
        });
        return { ok: true as const, potAfter: check.potAfter };
      },
      setActiveGoal(profileId, item: CatalogItem | string) {
        const row = requireRow(profiles, profileId);
        const catalogItem = typeof item === "string" ? null : item;
        const key = typeof item === "string" ? item : item.id;
        if (catalogItem?.kind === "mandatory") throw new Error("Обязательное не может быть Целью");
        if (catalogItem?.once && ownsItem(row, catalogItem.id)) throw new Error("Этот товар уже куплен");
        const existing = row.goals.find((goal) => goal.key === key);
        const cost = catalogItem?.price ?? existing?.cost;
        if (cost == null) throw new Error(`Цель ${key} не найдена`);
        row.goals = [{ key, cost, status: "active", isActive: true, fundedCelebrated: false }];
      },
      clearActiveGoal(profileId) {
        const row = requireRow(profiles, profileId);
        row.goals = [];
      },
      listGoals(profileId) {
        return requireRow(profiles, profileId).goals.map((g) => ({ ...g }));
      },
      listJournal(profileId) {
        return [...requireRow(profiles, profileId).journal];
      },
      purchasedItemIds(profileId, dayId) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        return [...new Set(row.purchases.filter((item) => item.dayId === dayId).map((item) => item.itemId))];
      },
      boughtAsActiveGoalCount(profileId) {
        return requireRow(profiles, profileId).purchases.filter((item) => item.boughtAsActiveGoal).length;
      },
      lastClosedDay(profileId) {
        return requireRow(profiles, profileId).lastClosed;
      },
      listTaskProgress(profileId) {
        return requireRow(profiles, profileId).tasks.map((task) => ({ ...task }));
      },
      applyTaskStep(profileId, dayId, result: TaskStepResult) {
        const row = requireRow(profiles, profileId);
        requireDayForTask(row, dayId);
        for (const effect of result.effects) {
          if (effect.meter && effect.delta) {
            if (effect.meter === "care") {
              row.care = applyMeterDelta(row.care, effect.delta);
            } else {
              row.mood = applyMeterDelta(row.mood, effect.delta);
            }
          }
          if (effect.coins && effect.coins > 0) {
            row.balance += effect.coins;
            appendJournal(row, {
              amount: effect.coins,
              kind: "task_scene",
              labelKey: "task_scene",
            });
          }
        }
        if (result.spawnTask && !row.tasks.some((task) => task.taskKey === result.spawnTask)) {
          row.tasks.push({ taskKey: result.spawnTask, status: "available", rewardPaid: false, bestReward: 0 });
        }
      },
      claimTaskReward(profileId, dayId, taskId, earned) {
        const row = requireRow(profiles, profileId);
        requireDayForTask(row, dayId);
        const existing = row.tasks.find((task) => task.taskKey === taskId);
        const best = existing?.bestReward ?? 0;
        const reward = rewardTopUp(best, earned);
        if (reward > 0) {
          row.balance += reward;
          appendJournal(row, {
            amount: reward,
            kind: "task_reward",
            labelKey: `task_reward:${taskId}`,
          });
        }
        const bestReward = Math.max(best, earned);
        if (existing) {
          existing.status = "completed";
          existing.rewardPaid = existing.rewardPaid || bestReward > 0;
          existing.bestReward = bestReward;
        } else {
          row.tasks.push({ taskKey: taskId, status: "completed", rewardPaid: bestReward > 0, bestReward });
        }
        return reward;
      },
      closeDay(profileId, catalog, bills = []) {
        const row = requireRow(profiles, profileId);
        if (!row.dayOpen) throw new Error("Нет открытого игрового дня");
        const bought = row.purchases.filter((item) => item.dayId === row.dayId);
        const mandatoryIds =
          bills.length > 0
            ? billsForDay(row.dayN, bills).items
            : catalog.filter((item) => item.kind === "mandatory").map((item) => item.id);
        const boughtIds = new Set(bought.map((item) => item.itemId));
        const mandatoryCovered = mandatoryIds.every((id) => boughtIds.has(id));
        const confirmed = row.planStatus === "confirmed" ? row.buckets : null;
        const withinPlan = planKept({ plan: confirmed, actual: actuals(row) });
        const deposited = row.transfers.some((item) => item.dayId === row.dayId && item.kind === "in");
        const score = dayScore({ mandatoryCovered, withinPlan, deposited });
        const optionalSpend = bought
          .filter((item) => item.kind === "optional" && item.paidFrom !== "savings")
          .reduce((sum, item) => sum + item.price, 0);
        const meterDeltas = dayCloseMeterDeltas({
          missedMandatory: !mandatoryCovered,
          optionalSpend,
          optionalPlan: confirmed ? confirmed.optional : null,
        });
        if (meterDeltas.care) row.care = applyMeterDelta(row.care, meterDeltas.care);
        if (meterDeltas.mood) row.mood = applyMeterDelta(row.mood, meterDeltas.mood);
        const previousStage = row.stage;
        row.scores.push(score);
        const stage = stageFromScores(row.scores);
        row.stage = stage;
        row.dayOpen = false;
        const summary: DaySummaryView = {
          dayId: row.dayId,
          n: row.dayN,
          score,
          facts: { mandatoryCovered, withinPlan, deposited },
          plan: { ...row.buckets },
          actual: actuals(row),
          meterDeltas,
          stage,
          previousStage,
          stageExplanation: explainStageChange(previousStage, stage),
        };
        row.lastClosed = summary;
        return summary;
      },
    },
  };
}

export function seedReturningChild(ports: SessionPorts, input?: Partial<CreateProfileInput>): string {
  const content = ports.content;
  const skateboard = content.catalog.find((item) => item.id === "skateboard");
  if (!skateboard) throw new Error("Нет целей в контенте");
  const id = ports.game.createProfile({
    name: "Миша",
    petName: "Пух",
    species: "sp1",
    color: "c1",
    accessory: "a1",
    contentVersion: content.contentVersion,
    goals: [{ key: skateboard.id, cost: skateboard.price }],
    activeGoalKey: skateboard.id,
    ...input,
  });
  ports.game.openDay(id);
  ports.meta.set(META_KEYS.activeProfileId, id);
  ports.meta.set(META_KEYS.onboardingDone, "1");
  ports.meta.set(META_KEYS.howToPlayDone, "1");
  return id;
}

/** Confirm the active open day so cadence tests can «Закончить день» without the Plan UI. */
export function confirmActiveDayPlan(
  ports: SessionPorts,
  buckets: PlanBuckets = { mandatory: 1, optional: 1, savings: 1 },
): void {
  const profileId = ports.meta.get(META_KEYS.activeProfileId);
  if (!profileId) throw new Error("Нет активного профиля");
  const day = ports.game.dayState(profileId);
  if (!day.open) throw new Error("Игровой день не найден");
  if (day.plan.status === "confirmed") return;
  if (day.plan.status === "none") {
    ports.game.saveDraftPlan(profileId, day.dayId, buckets);
  }
  const result = ports.game.confirmPlan(profileId, day.dayId);
  if (!result.ok) throw new Error("План не подтвердился");
}
