import { METERS } from "./config";

/** Plan buckets — Обязательные / Желаемые / Копилка (§2.1). */
export interface PlanBuckets {
  mandatory: number;
  optional: number;
  savings: number;
}

export function planTotal(b: PlanBuckets): number {
  return b.mandatory + b.optional + b.savings;
}

export interface PlanValidation {
  ok: boolean;
  total: number;
  /** Свободные монеты after the plan; negative total > available. */
  remainder: number;
}

/**
 * A plan is valid when its buckets never exceed the available amount (R5) and
 * the Обязательные bucket covers today's Счета (`minMandatory`, already clamped
 * to what the child can afford — see `planMandatoryFloor`).
 */
export function validatePlan(
  buckets: PlanBuckets,
  available: number,
  minMandatory = 0,
): PlanValidation {
  const total = planTotal(buckets);
  return {
    ok: total <= available && buckets.mandatory >= minMandatory,
    total,
    remainder: available - total,
  };
}

/** One entry of the Счета cycle: mandatory item ids due that Игровой день. */
export interface DayBills {
  items: readonly string[];
  /** Optional kid-facing reason, e.g. «Питомец простыл — нужно лекарство». */
  note?: string;
}

/** Счета for Игровой день `n` (1-based): the content cycle repeats. */
export function billsForDay(n: number, cycle: readonly DayBills[]): DayBills {
  if (cycle.length === 0) return { items: [] };
  const index = (((n - 1) % cycle.length) + cycle.length) % cycle.length;
  return cycle[index];
}

/** Sum of today's Счета prices. Unknown ids cost 0 (content validation rejects them). */
export function billsTotal(bills: DayBills, catalog: readonly Pick<CatalogItem, "id" | "price">[]): number {
  return bills.items.reduce((sum, id) => sum + (catalog.find((item) => item.id === id)?.price ?? 0), 0);
}

/**
 * Least the Обязательные bucket may hold: today's Счета, but never more than
 * the child has — otherwise a short Баланс would make every План invalid.
 */
export function planMandatoryFloor(billsSum: number, available: number): number {
  return Math.max(0, Math.min(billsSum, available));
}

export interface PlanKeptInput {
  plan: PlanBuckets | null;
  actual: PlanBuckets;
}

/**
 * «Обещание сдержано» — checked per bucket, so a plan cannot be gamed by
 * parking everything in Желаемые: Желаемые spend ≤ plan, Копилка deposits ≥
 * plan, and total purchases ≤ Обязательные + Желаемые.
 */
export function planKept({ plan, actual }: PlanKeptInput): boolean {
  if (plan === null) return false;
  return (
    actual.optional <= plan.optional &&
    actual.savings >= plan.savings &&
    actual.mandatory + actual.optional <= plan.mandatory + plan.optional
  );
}

export type PurchaseCheck =
  | { status: "ok" }
  | { status: "blocked"; missing: number };

/** A purchase must never push the balance negative (§3.2 invariants). */
export function checkPurchase(balance: number, price: number): PurchaseCheck {
  if (price < 0) throw new Error("Цена не может быть отрицательной");
  return balance >= price
    ? { status: "ok" }
    : { status: "blocked", missing: price - balance };
}

export type MeterKind = "care" | "mood";

/** Catalog item as seen by the engine (validated copy comes from data/content). */
export interface MeterEffect {
  meter: MeterKind;
  delta: number;
}

export interface CatalogItem {
  id: string;
  kind: "mandatory" | "optional";
  price: number;
  effect: MeterEffect;
  /** Обед also raises Счастье. Absent on every other item. */
  also?: MeterEffect;
  /** One-shot Желаемые leave Магазин after any purchase. */
  once?: boolean;
}

/** Meter moves a purchase applies. Обед returns both Сытость and Счастье. */
export function itemMeterEffects(item: Pick<CatalogItem, "effect" | "also">): MeterEffect[] {
  return item.also ? [item.effect, item.also] : [item.effect];
}

/** Care and mood deltas for a FeedbackCard. A missing meter stays unset. */
export function meterDeltaMap(item: Pick<CatalogItem, "effect" | "also">): { care?: number; mood?: number } {
  const deltas: { care?: number; mood?: number } = {};
  for (const effect of itemMeterEffects(item)) deltas[effect.meter] = effect.delta;
  return deltas;
}

/**
 * Which daily meter drops a day's Магазин purchases cancel.
 * A purchase counts only when it was paid from Баланс and one of its effects feeds that meter.
 * Buying the Цель from Копилка does not cancel a drop.
 */
export function dailyDropCovered(
  purchases: readonly { itemId: string; paidFrom: "balance" | "savings" }[],
  catalog: readonly Pick<CatalogItem, "id" | "effect" | "also">[],
): { care: boolean; mood: boolean } {
  const byId = new Map(catalog.map((item) => [item.id, item]));
  let care = false;
  let mood = false;
  for (const purchase of purchases) {
    if (purchase.paidFrom === "savings") continue;
    const item = byId.get(purchase.itemId);
    if (!item) continue;
    for (const effect of itemMeterEffects(item)) {
      if (effect.meter === "care") care = true;
      if (effect.meter === "mood") mood = true;
    }
  }
  return { care, mood };
}

/** Meters stay in 0–100 (§2.2). */
export function applyMeterDelta(current: number, delta: number): number {
  return Math.min(METERS.max, Math.max(METERS.min, current + delta));
}

export interface DayCloseMeters {
  /** A Магазин purchase today feeds Сытость, so the daily drop does not land. */
  careCovered: boolean;
  /** A Магазин purchase today feeds Счастье, so the daily drop does not land. */
  moodCovered: boolean;
  optionalSpend: number;
  /** Confirmed Желаемые bucket; null if the day had no confirmed plan. */
  optionalPlan: number | null;
  /** План was open and never confirmed. */
  planMissing: boolean;
}

/**
 * План was available during this Игровой день. Completing «Планирование бюджета»
 * is what ends that day, so the drop waits until a later day. Демо-режим has
 * План open from the start.
 */
export function planOpenAtClose(input: {
  isDemo: boolean;
  planLessonCompleted: boolean;
  planLessonEndsThisDay: boolean;
}): boolean {
  if (input.isDemo) return true;
  if (input.planLessonEndsThisDay) return false;
  return input.planLessonCompleted;
}

/**
 * Meter deltas applied at Итоги дня. Every day starts from the default drop;
 * a covering purchase cancels that meter's drop. Overspend and a missing План
 * are separate Счастье drops.
 */
export function dayCloseMeterDeltas(input: DayCloseMeters): {
  care: number;
  mood: number;
  /** The daily Счастье drop that landed. 0 when a purchase cancelled it. */
  dailyMood: number;
  overspend: number;
  /** Счастье taken because an open План was never confirmed. */
  noPlan: number;
} {
  const care = input.careCovered ? 0 : -METERS.dailyCareDrop;
  const dailyMood = input.moodCovered ? 0 : -METERS.dailyMoodDrop;
  const overspend =
    input.optionalPlan !== null && input.optionalSpend > input.optionalPlan
      ? -METERS.overspendMoodPenalty
      : 0;
  const noPlan = input.planMissing ? -METERS.noPlanMoodPenalty : 0;
  return { care, mood: dailyMood + overspend + noPlan, dailyMood, overspend, noPlan };
}
