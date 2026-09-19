import { and, desc, eq, isNotNull, isNull } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import type { Clock } from "../../core/clock";
import { ECONOMY, METERS } from "../../core/config";
import { canOpenNextDay, dayId as makeDayId } from "../../core/days";
import {
  applyMeterDelta,
  checkPurchase,
  dayCloseMeterDeltas,
  validatePlan,
  type CatalogItem,
  type PlanBuckets,
} from "../../core/economy";
import { applyGoalProgress, checkWithdrawal, estimateDaysToGoal, potFromTransfers } from "../../core/savings";
import {
  dayScore,
  explainStageChange,
  STAGE_CODES,
  stageFromCode,
  stageFromScores,
  type Stage,
} from "../../core/stages";
import { taskRewardDue, type TaskStepResult } from "../../core/tasks";
import { createLocalId } from "../localId";
import { META_KEYS } from "../metaKeys";
import * as tables from "../schema";
import type * as schema from "../schema";

export type GameDb = BaseSQLiteDatabase<"sync", unknown, typeof schema>;

export interface CreateProfileInput {
  id?: string;
  name: string;
  species: string;
  color: string;
  accessory: string;
  petName: string;
  isDemo?: boolean;
  contentVersion: number;
  goals: readonly { key: string; cost: number }[];
  activeGoalKey: string;
}

export type PurchaseResult = { status: "ok" } | { status: "blocked"; missing: number };
export type OpenDayResult =
  | { status: "opened"; dayId: string; n: number; allowanceCredited: boolean }
  | { status: "blocked" };
export type ConfirmPlanResult = { ok: true } | { ok: false; remainder: number };
export type WithdrawResult = { ok: true; potAfter: number } | { ok: false; potAfter: number };

export interface DaySummaryView {
  dayId: string;
  n: number;
  score: number;
  facts: { mandatoryCovered: boolean; withinPlan: boolean; deposited: boolean };
  plan: PlanBuckets;
  actual: PlanBuckets;
  meterDeltas: { care: number; mood: number };
  stage: Stage;
  previousStage: Stage;
  stageExplanation: string | null;
}

export type CloseDayResult = DaySummaryView;

export interface TaskProgressView {
  taskKey: string;
  status: string;
  rewardPaid: boolean;
}

/** Read model for the hub and PetView (appearance + meters + Баланс). */
export interface ProfileView {
  id: string;
  name: string;
  petName: string;
  species: string;
  color: string;
  accessory: string;
  balance: number;
  isDemo: boolean;
  care: number;
  mood: number;
  stage: Stage;
}

export interface SavingsView {
  pot: number;
  estimateDays: number | null;
  activeGoal: { key: string; cost: number; remaining: number; achieved: boolean } | null;
}

export interface DayState {
  dayId: string;
  n: number;
  open: boolean;
  plan: {
    status: "none" | "draft" | "confirmed";
    buckets: PlanBuckets;
  };
  available: number;
  actual: PlanBuckets;
}

export interface JournalEntry {
  id: string;
  dayN: number;
  createdAt: number;
  amount: number;
  kind: string;
  labelKey: string;
  itemId: string | null;
  goalId: string | null;
}

export interface GoalOption {
  key: string;
  cost: number;
  status: "active" | "achieved";
  isActive: boolean;
}

export type TransferResult =
  | { status: "ok"; achieved: boolean }
  | { status: "blocked"; missing: number };

/**
 * Intent-level persistence seam: every coin movement writes its transaction
 * (and purchase/meter rows) atomically and keeps balance == Σ transactions.
 */
export function createGameRepository(db: GameDb, clock: Clock) {
  const nowMs = () => clock.now().getTime();
  const newId = (prefix: string) => createLocalId(prefix);

  function profile(conn: GameDb, profileId: string) {
    const row = conn.select().from(tables.profiles).where(eq(tables.profiles.id, profileId)).get();
    if (!row) throw new Error(`Профиль ${profileId} не найден`);
    return row;
  }

  function pet(conn: GameDb, profileId: string) {
    const row = conn.select().from(tables.petState).where(eq(tables.petState.profileId, profileId)).get();
    if (!row) throw new Error(`Питомца профиля ${profileId} нет`);
    return row;
  }

  function writeTx(
    conn: GameDb,
    input: {
      profileId: string;
      dayId: string | null;
      kind: string;
      amount: number;
      labelKey: string;
      itemId?: string | null;
      goalId?: string | null;
    },
  ) {
    conn
      .insert(tables.transactions)
      .values({
        id: newId("tx"),
        profileId: input.profileId,
        dayId: input.dayId,
        kind: input.kind,
        amount: input.amount,
        itemId: input.itemId ?? null,
        goalId: input.goalId ?? null,
        labelKey: input.labelKey,
        createdAt: nowMs(),
      })
      .run();
  }

  function setBalance(conn: GameDb, profileId: string, balance: number) {
    if (balance < 0) throw new Error("Баланс не может быть отрицательным");
    conn.update(tables.profiles).set({ balance }).where(eq(tables.profiles.id, profileId)).run();
  }

  function credit(
    conn: GameDb,
    profileId: string,
    dayId: string | null,
    amount: number,
    kind: string,
    labelKey: string,
  ) {
    const row = profile(conn, profileId);
    setBalance(conn, profileId, row.balance + amount);
    writeTx(conn, { profileId, dayId, kind, amount, labelKey });
  }

  function debit(
    conn: GameDb,
    profileId: string,
    dayId: string | null,
    amount: number,
    kind: string,
    labelKey: string,
    extra: { itemId?: string; goalId?: string } = {},
  ): PurchaseResult {
    const row = profile(conn, profileId);
    const check = checkPurchase(row.balance, amount);
    if (check.status === "blocked") return check;
    setBalance(conn, profileId, row.balance - amount);
    writeTx(conn, {
      profileId,
      dayId,
      kind,
      amount: -amount,
      labelKey,
      itemId: extra.itemId,
      goalId: extra.goalId,
    });
    return { status: "ok" };
  }

  function applyMeter(
    conn: GameDb,
    profileId: string,
    dayId: string | null,
    meter: "care" | "mood",
    delta: number,
    source: string,
  ) {
    if (delta === 0) return;
    const row = pet(conn, profileId);
    const current = meter === "care" ? row.care : row.mood;
    const next = applyMeterDelta(current, delta);
    conn
      .update(tables.petState)
      .set(meter === "care" ? { care: next } : { mood: next })
      .where(eq(tables.petState.profileId, profileId))
      .run();
    conn
      .insert(tables.meterEvents)
      .values({
        id: newId("me"),
        profileId,
        dayId,
        meter,
        delta,
        source,
        createdAt: nowMs(),
      })
      .run();
  }

  function planForDay(conn: GameDb, dayId: string) {
    return conn.select().from(tables.plans).where(eq(tables.plans.dayId, dayId)).get();
  }

  function activeGoal(conn: GameDb, profileId: string) {
    return conn
      .select()
      .from(tables.goals)
      .where(and(eq(tables.goals.profileId, profileId), eq(tables.goals.isActive, 1)))
      .get();
  }

  function openDayRow(conn: GameDb, profileId: string) {
    return conn
      .select()
      .from(tables.days)
      .where(and(eq(tables.days.profileId, profileId), isNull(tables.days.closedAt)))
      .get();
  }

  function requireOpenDay(conn: GameDb, profileId: string, dayId: string) {
    const day = conn.select().from(tables.days).where(eq(tables.days.id, dayId)).get();
    if (!day || day.profileId !== profileId) throw new Error("Игровой день не найден");
    if (day.closedAt !== null) throw new Error("Игровой день уже закрыт");
    return day;
  }

  function latestClosedDay(conn: GameDb, profileId: string) {
    return conn
      .select()
      .from(tables.days)
      .where(and(eq(tables.days.profileId, profileId), isNotNull(tables.days.closedAt)))
      .orderBy(desc(tables.days.n))
      .get();
  }

  function emptyBuckets(): PlanBuckets {
    return { mandatory: 0, optional: 0, savings: 0 };
  }

  function planBuckets(plan: { mandatory: number; optional: number; savings: number } | undefined): PlanBuckets {
    return plan
      ? { mandatory: plan.mandatory, optional: plan.optional, savings: plan.savings }
      : emptyBuckets();
  }

  function actualForDay(conn: GameDb, dayId: string): PlanBuckets {
    const bought = conn.select().from(tables.purchases).where(eq(tables.purchases.dayId, dayId)).all();
    const deposits = conn
      .select()
      .from(tables.savingsTransfers)
      .where(and(eq(tables.savingsTransfers.dayId, dayId), eq(tables.savingsTransfers.kind, "in")))
      .all();
    return {
      mandatory: bought.filter((row) => row.kind === "mandatory").reduce((sum, row) => sum + row.price, 0),
      optional: bought.filter((row) => row.kind === "optional").reduce((sum, row) => sum + row.price, 0),
      savings: deposits.reduce((sum, row) => sum + row.amount, 0),
    };
  }

  function dayStateFrom(
    conn: GameDb,
    profileId: string,
    day: { id: string; n: number },
    open: boolean,
  ): DayState {
    const plan = planForDay(conn, day.id);
    return {
      dayId: day.id,
      n: day.n,
      open,
      plan: {
        status: plan?.status ?? "none",
        buckets: planBuckets(plan),
      },
      available: profile(conn, profileId).balance,
      actual: actualForDay(conn, day.id),
    };
  }

  function orderedScores(conn: GameDb, profileId: string) {
    const days = conn.select().from(tables.days).where(eq(tables.days.profileId, profileId)).all();
    const scores = conn.select().from(tables.dayScores).where(eq(tables.dayScores.profileId, profileId)).all();
    const nById = new Map(days.map((day) => [day.id, day.n]));
    return scores
      .map((row) => ({ ...row, n: nById.get(row.dayId) ?? 0 }))
      .sort((a, b) => a.n - b.n);
  }

  function readDaySummary(conn: GameDb, profileId: string, dayId: string): DaySummaryView | null {
    const day = conn.select().from(tables.days).where(eq(tables.days.id, dayId)).get();
    const scoreRow = conn.select().from(tables.dayScores).where(eq(tables.dayScores.dayId, dayId)).get();
    if (!day || !scoreRow) return null;
    const upto = orderedScores(conn, profileId).filter((row) => row.n <= day.n);
    const previousStage = stageFromScores(upto.slice(0, -1).map((row) => row.score));
    const stage = stageFromScores(upto.map((row) => row.score));
    const events = conn
      .select()
      .from(tables.meterEvents)
      .where(and(eq(tables.meterEvents.dayId, dayId), eq(tables.meterEvents.source, "day_close")))
      .all();
    return {
      dayId: day.id,
      n: day.n,
      score: scoreRow.score,
      facts: {
        mandatoryCovered: scoreRow.mandatoryCovered === 1,
        withinPlan: scoreRow.withinPlan === 1,
        deposited: scoreRow.deposited === 1,
      },
      plan: planBuckets(planForDay(conn, dayId)),
      actual: actualForDay(conn, dayId),
      meterDeltas: {
        care: events.filter((event) => event.meter === "care").reduce((sum, event) => sum + event.delta, 0),
        mood: events.filter((event) => event.meter === "mood").reduce((sum, event) => sum + event.delta, 0),
      },
      stage,
      previousStage,
      stageExplanation: explainStageChange(previousStage, stage),
    };
  }

  function insertProfile(conn: GameDb, input: CreateProfileInput, id: string) {
    conn
      .insert(tables.profiles)
      .values({
        id,
        name: input.name,
        species: input.species,
        color: input.color,
        accessory: input.accessory,
        petName: input.petName,
        balance: 0,
        isDemo: input.isDemo ? 1 : 0,
        contentVersion: input.contentVersion,
        createdAt: nowMs(),
      })
      .run();
    conn
      .insert(tables.petState)
      .values({
        profileId: id,
        care: METERS.initialCare,
        mood: METERS.initialMood,
        stage: STAGE_CODES.novice,
      })
      .run();
    for (const goal of input.goals) {
      conn
        .insert(tables.goals)
        .values({
          id: newId("goal"),
          profileId: id,
          key: goal.key,
          cost: goal.cost,
          status: "active",
          isActive: goal.key === input.activeGoalKey ? 1 : 0,
          achievedAt: null,
        })
        .run();
    }
    credit(conn, id, null, ECONOMY.startingBudget, "starting_grant", "starting_grant");
  }

  function setMeta(conn: GameDb, key: string, value: string) {
    conn
      .insert(tables.meta)
      .values({ key, value })
      .onConflictDoUpdate({ target: tables.meta.key, set: { value } })
      .run();
  }

  return {
    createProfile(input: CreateProfileInput): string {
      const id = input.id ?? createLocalId("profile");
      db.transaction((tx) => {
        insertProfile(tx, input, id);
      });
      return id;
    },

    completeFirstRun(input: CreateProfileInput): string {
      const id = input.id ?? createLocalId("profile");
      const existing = db.select().from(tables.profiles).where(eq(tables.profiles.id, id)).get();
      if (existing) {
        const active = db
          .select()
          .from(tables.meta)
          .where(eq(tables.meta.key, META_KEYS.activeProfileId))
          .get();
        const done = db
          .select()
          .from(tables.meta)
          .where(eq(tables.meta.key, META_KEYS.onboardingDone))
          .get();
        if (active?.value === id && done?.value === "1") return id;
        throw new Error(`Профиль ${id} уже существует`);
      }
      db.transaction((tx) => {
        insertProfile(tx, input, id);
        setMeta(tx, META_KEYS.activeProfileId, id);
        setMeta(tx, META_KEYS.onboardingDone, "1");
      });
      return id;
    },

    getProfile(profileId: string): ProfileView {
      const row = profile(db, profileId);
      const petRow = pet(db, profileId);
      return {
        id: row.id,
        name: row.name,
        petName: row.petName,
        species: row.species,
        color: row.color,
        accessory: row.accessory,
        balance: row.balance,
        isDemo: row.isDemo === 1,
        care: petRow.care,
        mood: petRow.mood,
        stage: stageFromCode(petRow.stage),
      };
    },

    deleteProfile(profileId: string): void {
      db.transaction((tx) => {
        profile(tx, profileId);
        tx.delete(tables.meterEvents).where(eq(tables.meterEvents.profileId, profileId)).run();
        tx.delete(tables.dayScores).where(eq(tables.dayScores.profileId, profileId)).run();
        tx.delete(tables.purchases).where(eq(tables.purchases.profileId, profileId)).run();
        tx.delete(tables.savingsTransfers).where(eq(tables.savingsTransfers.profileId, profileId)).run();
        tx.delete(tables.plans).where(eq(tables.plans.profileId, profileId)).run();
        tx.delete(tables.transactions).where(eq(tables.transactions.profileId, profileId)).run();
        tx.delete(tables.taskProgress).where(eq(tables.taskProgress.profileId, profileId)).run();
        tx.delete(tables.goals).where(eq(tables.goals.profileId, profileId)).run();
        tx.delete(tables.petState).where(eq(tables.petState.profileId, profileId)).run();
        tx.delete(tables.days).where(eq(tables.days.profileId, profileId)).run();
        tx.delete(tables.profiles).where(eq(tables.profiles.id, profileId)).run();
      });
    },

    openDay(profileId: string): OpenDayResult {
      return db.transaction((tx) => {
        const open = openDayRow(tx, profileId);
        if (open) {
          return { status: "opened" as const, dayId: open.id, n: open.n, allowanceCredited: false };
        }
        const last = tx
          .select()
          .from(tables.days)
          .where(eq(tables.days.profileId, profileId))
          .orderBy(desc(tables.days.n))
          .get();
        const row = profile(tx, profileId);
        const isDemo = row.isDemo === 1;
        if (last?.closedAt != null && !canOpenNextDay(clock, new Date(last.closedAt), isDemo)) {
          return { status: "blocked" as const };
        }
        const n = last ? last.n + 1 : 1;
        const dayId = makeDayId(profileId, n);
        tx.insert(tables.days)
          .values({
            id: dayId,
            profileId,
            n,
            openedAt: nowMs(),
            closedAt: null,
          })
          .run();
        credit(tx, profileId, dayId, ECONOMY.allowance, "allowance", "allowance");
        return { status: "opened" as const, dayId, n, allowanceCredited: true };
      });
    },

    saveDraftPlan(profileId: string, dayId: string, buckets: PlanBuckets): void {
      db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        if (buckets.mandatory < 0 || buckets.optional < 0 || buckets.savings < 0) {
          throw new Error("Суммы плана не могут быть отрицательными");
        }
        const existing = planForDay(tx, dayId);
        if (existing?.status === "confirmed") {
          throw new Error("План уже подтверждён");
        }
        if (existing) {
          tx.update(tables.plans)
            .set({
              mandatory: buckets.mandatory,
              optional: buckets.optional,
              savings: buckets.savings,
            })
            .where(eq(tables.plans.id, existing.id))
            .run();
          return;
        }
        tx.insert(tables.plans)
          .values({
            id: newId("plan"),
            profileId,
            dayId,
            mandatory: buckets.mandatory,
            optional: buckets.optional,
            savings: buckets.savings,
            status: "draft",
            confirmedAt: null,
          })
          .run();
      });
    },

    confirmPlan(profileId: string, dayId: string): ConfirmPlanResult {
      return db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        const existing = planForDay(tx, dayId);
        if (!existing) throw new Error("Сначала составь план");
        if (existing.status === "confirmed") throw new Error("План уже подтверждён");
        const available = profile(tx, profileId).balance;
        const check = validatePlan(
          { mandatory: existing.mandatory, optional: existing.optional, savings: existing.savings },
          available,
        );
        if (!check.ok) return { ok: false as const, remainder: check.remainder };
        tx.update(tables.plans)
          .set({ status: "confirmed", confirmedAt: nowMs() })
          .where(eq(tables.plans.id, existing.id))
          .run();
        return { ok: true as const };
      });
    },

    purchase(profileId: string, dayId: string, item: CatalogItem): PurchaseResult {
      return db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        const result = debit(tx, profileId, dayId, item.price, "purchase", `purchase:${item.id}`, {
          itemId: item.id,
        });
        if (result.status === "blocked") return result;
        tx.insert(tables.purchases)
          .values({
            id: newId("buy"),
            profileId,
            dayId,
            itemId: item.id,
            price: item.price,
            kind: item.kind,
            createdAt: nowMs(),
          })
          .run();
        applyMeter(tx, profileId, dayId, item.effect.meter, item.effect.delta, `purchase:${item.id}`);
        return { status: "ok" as const };
      });
    },

    transferToSavings(profileId: string, dayId: string, amount: number): TransferResult {
      return db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        if (amount <= 0) throw new Error("Сумма должна быть больше нуля");
        const active = activeGoal(tx, profileId);
        const result = debit(tx, profileId, dayId, amount, "savings_in", "savings_in", {
          goalId: active?.key,
        });
        if (result.status === "blocked") return { status: "blocked" as const, missing: result.missing };
        tx.insert(tables.savingsTransfers)
          .values({
            id: newId("sav"),
            profileId,
            dayId,
            amount,
            kind: "in",
            createdAt: nowMs(),
          })
          .run();
        const transfers = tx
          .select()
          .from(tables.savingsTransfers)
          .where(eq(tables.savingsTransfers.profileId, profileId))
          .all();
        const pot = potFromTransfers(transfers);
        let achieved = false;
        if (active) {
          const progress = applyGoalProgress(pot, active.cost);
          if (progress.achieved) {
            achieved = true;
            tx.insert(tables.savingsTransfers)
              .values({
                id: newId("sav"),
                profileId,
                dayId,
                amount: active.cost,
                kind: "out",
                createdAt: nowMs(),
              })
              .run();
            tx.update(tables.goals)
              .set({ status: "achieved", isActive: 0, achievedAt: nowMs() })
              .where(eq(tables.goals.id, active.id))
              .run();
            applyMeter(tx, profileId, dayId, "mood", METERS.goalAchievedMoodBonus, `goal:${active.key}`);
          }
        }
        return { status: "ok" as const, achieved };
      });
    },

    withdrawFromSavings(profileId: string, dayId: string, amount: number): WithdrawResult {
      return db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        const transfers = tx
          .select()
          .from(tables.savingsTransfers)
          .where(eq(tables.savingsTransfers.profileId, profileId))
          .all();
        const pot = potFromTransfers(transfers);
        const check = checkWithdrawal(pot, amount);
        if (!check.ok) return { ok: false as const, potAfter: check.potAfter };
        credit(tx, profileId, dayId, amount, "savings_out", "savings_out");
        tx.insert(tables.savingsTransfers)
          .values({
            id: newId("sav"),
            profileId,
            dayId,
            amount,
            kind: "out",
            createdAt: nowMs(),
          })
          .run();
        return { ok: true as const, potAfter: check.potAfter };
      });
    },

    setActiveGoal(profileId: string, goalKey: string): void {
      db.transaction((tx) => {
        const goal = tx
          .select()
          .from(tables.goals)
          .where(and(eq(tables.goals.profileId, profileId), eq(tables.goals.key, goalKey)))
          .get();
        if (!goal) throw new Error(`Цель ${goalKey} не найдена`);
        if (goal.status === "achieved") throw new Error("Эта Цель уже достигнута");
        tx.update(tables.goals)
          .set({ isActive: 0 })
          .where(eq(tables.goals.profileId, profileId))
          .run();
        tx.update(tables.goals)
          .set({ isActive: 1 })
          .where(eq(tables.goals.id, goal.id))
          .run();
      });
    },

    dayState(profileId: string): DayState {
      const open = openDayRow(db, profileId);
      if (open) return dayStateFrom(db, profileId, open, true);
      const closed = latestClosedDay(db, profileId);
      if (closed) return dayStateFrom(db, profileId, closed, false);
      throw new Error("Нет открытого игрового дня");
    },

    lastClosedDay(profileId: string): DaySummaryView | null {
      profile(db, profileId);
      const last = latestClosedDay(db, profileId);
      if (!last) return null;
      return readDaySummary(db, profileId, last.id);
    },

    listTaskProgress(profileId: string): TaskProgressView[] {
      profile(db, profileId);
      return db
        .select()
        .from(tables.taskProgress)
        .where(eq(tables.taskProgress.profileId, profileId))
        .all()
        .map((row) => ({
          taskKey: row.taskKey,
          status: row.status,
          rewardPaid: row.rewardPaid === 1,
        }));
    },

    listJournal(profileId: string): JournalEntry[] {
      profile(db, profileId);
      const txs = db
        .select()
        .from(tables.transactions)
        .where(eq(tables.transactions.profileId, profileId))
        .orderBy(desc(tables.transactions.createdAt))
        .all();
      const days = db.select().from(tables.days).where(eq(tables.days.profileId, profileId)).all();
      const nById = new Map(days.map((day) => [day.id, day.n]));
      return txs.map((tx) => ({
        id: tx.id,
        dayN: tx.dayId ? (nById.get(tx.dayId) ?? 0) : 0,
        createdAt: tx.createdAt,
        amount: tx.amount,
        kind: tx.kind,
        labelKey: tx.labelKey,
        itemId: tx.itemId,
        goalId: tx.goalId,
      }));
    },

    listGoals(profileId: string): GoalOption[] {
      profile(db, profileId);
      return db
        .select()
        .from(tables.goals)
        .where(eq(tables.goals.profileId, profileId))
        .all()
        .map((row) => ({
          key: row.key,
          cost: row.cost,
          status: row.status,
          isActive: row.isActive === 1,
        }));
    },

    purchasedItemIds(profileId: string, dayId: string): string[] {
      requireOpenDay(db, profileId, dayId);
      const bought = db.select().from(tables.purchases).where(eq(tables.purchases.dayId, dayId)).all();
      return [...new Set(bought.map((row) => row.itemId))];
    },

    savingsState(profileId: string): SavingsView {
      const transfers = db
        .select()
        .from(tables.savingsTransfers)
        .where(eq(tables.savingsTransfers.profileId, profileId))
        .all();
      const pot = potFromTransfers(transfers);
      const deposits = transfers.filter((t) => t.kind === "in").map((t) => t.amount);
      const active = activeGoal(db, profileId);
      if (!active) {
        return { pot, estimateDays: null as number | null, activeGoal: null };
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

    closeDay(profileId: string, catalog: readonly CatalogItem[]): CloseDayResult {
      return db.transaction((tx) => {
        const day = openDayRow(tx, profileId);
        if (!day) throw new Error("Нет открытого игрового дня");
        const bought = tx.select().from(tables.purchases).where(eq(tables.purchases.dayId, day.id)).all();
        const plan = planForDay(tx, day.id);
        const deposits = tx
          .select()
          .from(tables.savingsTransfers)
          .where(and(eq(tables.savingsTransfers.dayId, day.id), eq(tables.savingsTransfers.kind, "in")))
          .all();
        const mandatoryIds = catalog.filter((item) => item.kind === "mandatory").map((item) => item.id);
        const boughtIds = new Set(bought.map((row) => row.itemId));
        const mandatoryCovered = mandatoryIds.every((id) => boughtIds.has(id));
        const actualSpend = bought.reduce((sum, row) => sum + row.price, 0);
        const confirmed = plan?.status === "confirmed" ? plan : null;
        const withinPlan =
          confirmed !== null && actualSpend <= confirmed.mandatory + confirmed.optional;
        const deposited = deposits.length > 0;
        const score = dayScore({ mandatoryCovered, withinPlan, deposited });
        const optionalSpend = bought
          .filter((row) => row.kind === "optional")
          .reduce((sum, row) => sum + row.price, 0);
        const deltas = dayCloseMeterDeltas({
          missedMandatory: !mandatoryCovered,
          optionalSpend,
          optionalPlan: confirmed ? confirmed.optional : null,
        });
        applyMeter(tx, profileId, day.id, "care", deltas.care, "day_close");
        applyMeter(tx, profileId, day.id, "mood", deltas.mood, "day_close");
        const previous = tx
          .select()
          .from(tables.dayScores)
          .where(eq(tables.dayScores.profileId, profileId))
          .all();
        const scores = [...previous.map((row) => row.score), score];
        const to = stageFromScores(scores);
        tx.insert(tables.dayScores)
          .values({
            id: newId("score"),
            profileId,
            dayId: day.id,
            mandatoryCovered: mandatoryCovered ? 1 : 0,
            withinPlan: withinPlan ? 1 : 0,
            deposited: deposited ? 1 : 0,
            score,
          })
          .run();
        tx.update(tables.petState)
          .set({ stage: STAGE_CODES[to] })
          .where(eq(tables.petState.profileId, profileId))
          .run();
        tx.update(tables.days).set({ closedAt: nowMs() }).where(eq(tables.days.id, day.id)).run();
        const summary = readDaySummary(tx, profileId, day.id);
        if (!summary) throw new Error("Нет итогов закрытого дня");
        return summary;
      });
    },

    applyTaskStep(profileId: string, dayId: string, result: TaskStepResult): void {
      db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        for (const effect of result.effects) {
          if (effect.meter && effect.delta) {
            applyMeter(tx, profileId, dayId, effect.meter, effect.delta, "task");
          }
          if (effect.coins && effect.coins > 0) {
            credit(tx, profileId, dayId, effect.coins, "task_scene", "task_scene");
          }
        }
        if (result.spawnTask) {
          const existing = tx
            .select()
            .from(tables.taskProgress)
            .where(
              and(
                eq(tables.taskProgress.profileId, profileId),
                eq(tables.taskProgress.taskKey, result.spawnTask),
              ),
            )
            .get();
          if (!existing) {
            tx.insert(tables.taskProgress)
              .values({
                id: newId("task"),
                profileId,
                taskKey: result.spawnTask,
                status: "available",
                rewardPaid: 0,
                completedAt: null,
              })
              .run();
          }
        }
      });
    },

    claimTaskReward(profileId: string, dayId: string, taskId: string, correct: boolean): number {
      return db.transaction((tx) => {
        requireOpenDay(tx, profileId, dayId);
        const existing = tx
          .select()
          .from(tables.taskProgress)
          .where(and(eq(tables.taskProgress.profileId, profileId), eq(tables.taskProgress.taskKey, taskId)))
          .get();
        const alreadyPaid = existing?.rewardPaid === 1;
        const reward = correct ? taskRewardDue(alreadyPaid) : 0;
        if (reward > 0) {
          credit(tx, profileId, dayId, reward, "task_reward", `task_reward:${taskId}`);
        }
        if (existing) {
          tx.update(tables.taskProgress)
            .set({
              status: "completed",
              rewardPaid: alreadyPaid || reward > 0 ? 1 : existing.rewardPaid,
              completedAt: nowMs(),
            })
            .where(eq(tables.taskProgress.id, existing.id))
            .run();
        } else {
          tx.insert(tables.taskProgress)
            .values({
              id: newId("task"),
              profileId,
              taskKey: taskId,
              status: "completed",
              rewardPaid: reward > 0 ? 1 : 0,
              completedAt: nowMs(),
            })
            .run();
        }
        return reward;
      });
    },
  };
}
