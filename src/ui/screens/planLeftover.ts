import type { PlanBuckets } from "../../core/economy";
import type { DayState } from "../../data/repositories/gameRepository";

export function confirmedLeftover(
  day: DayState | null | undefined,
  bucket: keyof PlanBuckets,
): number | null {
  if (day?.plan.status !== "confirmed") return null;
  return day.plan.buckets[bucket] - day.actual[bucket];
}

export function leftoverAfterTap(leftover: number | null, amount: number): number | null {
  return leftover == null ? null : leftover - amount;
}
