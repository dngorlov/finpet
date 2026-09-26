import type { BudgetBucket, BudgetSplit } from "./tasks";

/** Order of buckets everywhere on screen: need → want → save. */
export const BUDGET_BUCKETS: readonly BudgetBucket[] = ["mandatory", "wants", "savings"];

export function splitSum(split: BudgetSplit): number {
  return split.mandatory + split.wants + split.savings;
}

export type AllocationStatus =
  | { kind: "short"; left: number }
  | { kind: "over"; over: number }
  | { kind: "exact" };

/** «Осталось распределить N» / «Больше, чем есть, на N» / exact. */
export function allocationStatus(split: BudgetSplit, total: number): AllocationStatus {
  const sum = splitSum(split);
  if (sum < total) return { kind: "short", left: total - sum };
  if (sum > total) return { kind: "over", over: sum - total };
  return { kind: "exact" };
}

/** Пересобери план: the plan right after the surprise (the event bucket already grew). */
export function planAfterEvent(plan: BudgetSplit, event: { bucket: BudgetBucket; delta: number }): BudgetSplit {
  return { ...plan, [event.bucket]: plan[event.bucket] + event.delta };
}

/**
 * The surprise takes `amount` out of the jar the child points at.
 * Null when that jar cannot cover it — they pay with the steppers instead.
 */
export function stealFromJar(split: BudgetSplit, bucket: BudgetBucket, amount: number): BudgetSplit | null {
  if (amount <= 0 || split[bucket] < amount) return null;
  return { ...split, [bucket]: split[bucket] - amount };
}

/**
 * Which bucket paid most for the surprise — it picks the consequence line.
 * Null when nothing was cut (e.g. the child only moved coins around).
 */
export function replanPaidBy(
  before: BudgetSplit,
  after: BudgetSplit,
  locked: BudgetBucket,
): BudgetBucket | null {
  let best: BudgetBucket | null = null;
  let bestCut = 0;
  for (const bucket of BUDGET_BUCKETS) {
    if (bucket === locked) continue;
    const cut = before[bucket] - after[bucket];
    if (cut > bestCut) {
      best = bucket;
      bestCut = cut;
    }
  }
  return best;
}

/**
 * План и факт: what really happened. Spending comes from choices; whatever
 * was not spent is what got saved.
 */
export function factFromSpending(total: number, spent: Partial<BudgetSplit>): BudgetSplit {
  const mandatory = spent.mandatory ?? 0;
  const wants = spent.wants ?? 0;
  return { mandatory, wants, savings: Math.max(0, total - mandatory - wants) + (spent.savings ?? 0) };
}

/** Plan vs fact per bucket: positive = more than planned. */
export function planFactDiff(plan: BudgetSplit, fact: BudgetSplit): BudgetSplit {
  return {
    mandatory: fact.mandatory - plan.mandatory,
    wants: fact.wants - plan.wants,
    savings: fact.savings - plan.savings,
  };
}

/** Rounds to reach `target` from `saved` putting `perRound` each time (null if never). */
export function roundsToGoal(saved: number, target: number, perRound: number): number | null {
  if (saved >= target) return 0;
  if (perRound <= 0) return null;
  return Math.ceil((target - saved) / perRound);
}
