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
export interface CatalogItem {
  id: string;
  kind: "mandatory" | "optional";
  price: number;
  effect: { meter: MeterKind; delta: number };
}

/** On-line purchase effect: purchase raises the meter by the item's effect (§2.2). */
export function purchaseMeterEffect(item: CatalogItem): { meter: MeterKind; delta: number } {
  return item.effect;
}

/** Meters stay in 0–100 (§2.2). */
export function applyMeterDelta(current: number, delta: number): number {
  return Math.min(METERS.max, Math.max(METERS.min, current + delta));
}

export interface DayCloseMeters {
  /** −15 when the day ends with any unpurchased mandatory item. */
  missedMandatory: boolean;
  optionalSpend: number;
  /** Confirmed Желаемые bucket; null if the day had no confirmed plan. */
  optionalPlan: number | null;
}

/** Meter deltas applied at Итоги дня — not silent, always sourced as day-close. */
export function dayCloseMeterDeltas(input: DayCloseMeters): { care: number; mood: number } {
  const care = input.missedMandatory ? -METERS.missedMandatoryCarePenalty : 0;
  const mood =
    input.optionalPlan !== null && input.optionalSpend > input.optionalPlan
      ? -METERS.overspendMoodPenalty
      : 0;
  return { care, mood };
}
