import { ECONOMY, METERS } from "../../core/config";
import {
  applyMeterDelta,
  checkPurchase,
  validatePlan,
  type CatalogItem,
  type PlanBuckets,
} from "../../core/economy";
import { applyGoalProgress, checkWithdrawal, estimateDaysToGoal, potFromTransfers } from "../../core/savings";
import { loadContent } from "../../data/content";
import { META_KEYS } from "../../data/metaKeys";
import type {
  CreateProfileInput,
  DayState,
  GoalOption,
  JournalEntry,
  ProfileView,
} from "../../data/repositories/gameRepository";
import type { SessionPorts } from "../session/types";

type TransferRow = { dayId: string; amount: number; kind: "in" | "out" };
type PurchaseRow = { dayId: string; itemId: string; price: number; kind: "mandatory" | "optional" };

type StoredProfile = ProfileView & {
  dayOpen: boolean;
  dayId: string;
  dayN: number;
  goals: GoalOption[];
  planStatus: DayState["plan"]["status"];
  buckets: PlanBuckets;
  journal: JournalEntry[];
  purchases: PurchaseRow[];
  transfers: TransferRow[];
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
  return {
    mandatory: today.filter((item) => item.kind === "mandatory").reduce((sum, item) => sum + item.price, 0),
    optional: today.filter((item) => item.kind === "optional").reduce((sum, item) => sum + item.price, 0),
    savings: row.transfers
      .filter((item) => item.dayId === row.dayId && item.kind === "in")
      .reduce((sum, item) => sum + item.amount, 0),
  };
}

function dayStateOf(row: StoredProfile): DayState {
  if (!row.dayOpen) throw new Error("Нет открытого игрового дня");
  return {
    dayId: row.dayId,
    n: row.dayN,
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
      goals: input.goals.map((g) => ({
        key: g.key,
        cost: g.cost,
        status: "active",
        isActive: g.key === input.activeGoalKey,
      })),
      planStatus: "none",
      buckets: emptyBuckets(),
      journal: [],
      purchases: [],
      transfers: [],
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
        const dayId = `${profileId}#${row.dayN}`;
        if (row.dayOpen) {
          return { status: "opened" as const, dayId, n: row.dayN, allowanceCredited: false };
        }
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
      confirmPlan(profileId, dayId) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        if (row.planStatus === "none") throw new Error("Сначала составь план");
        if (row.planStatus === "confirmed") throw new Error("План уже подтверждён");
        const check = validatePlan(row.buckets, row.balance);
        if (!check.ok) return { ok: false as const, remainder: check.remainder };
        row.planStatus = "confirmed";
        return { ok: true as const };
      },
      purchase(profileId, dayId, item: CatalogItem) {
        const row = requireRow(profiles, profileId);
        requireOpen(row, dayId);
        const check = checkPurchase(row.balance, item.price);
        if (check.status === "blocked") return check;
        row.balance -= item.price;
        row.purchases.push({ dayId, itemId: item.id, price: item.price, kind: item.kind });
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
          if (progress.achieved) {
            achieved = true;
            row.transfers.push({ dayId, amount: active.cost, kind: "out" });
            active.status = "achieved";
            active.isActive = false;
            row.mood = applyMeterDelta(row.mood, METERS.goalAchievedMoodBonus);
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
      setActiveGoal(profileId, goalKey) {
        const row = requireRow(profiles, profileId);
        const goal = row.goals.find((g) => g.key === goalKey);
        if (!goal) throw new Error(`Цель ${goalKey} не найдена`);
        if (goal.status === "achieved") throw new Error("Эта Цель уже достигнута");
        for (const item of row.goals) item.isActive = item.key === goalKey;
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
    },
  };
}

export function seedReturningChild(ports: SessionPorts, input?: Partial<CreateProfileInput>): string {
  const content = ports.content;
  const firstGoal = content.goals[0];
  if (!firstGoal) throw new Error("Нет целей в контенте");
  const id = ports.game.createProfile({
    name: "Миша",
    petName: "Пух",
    species: "sp1",
    color: "c1",
    accessory: "a1",
    contentVersion: content.contentVersion,
    goals: content.goals.map((g) => ({ key: g.id, cost: g.cost })),
    activeGoalKey: firstGoal.id,
    ...input,
  });
  ports.game.openDay(id);
  ports.meta.set(META_KEYS.activeProfileId, id);
  ports.meta.set(META_KEYS.onboardingDone, "1");
  return id;
}
