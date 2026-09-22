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

/** A plan is valid when its buckets never exceed the available amount (R5). */
export function validatePlan(buckets: PlanBuckets, available: number): PlanValidation {
  const total = planTotal(buckets);
  return { ok: total <= available, total, remainder: available - total };
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
  /** One-shot Желаемые leave Магазин after any purchase. */
  once?: boolean;
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
