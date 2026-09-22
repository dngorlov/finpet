import { SAVINGS } from "./config";

/** Completion-date estimate (§2.1): remaining ÷ rolling average deposit; «—» (null) before the first transfer. */
export function estimateDaysToGoal(remaining: number, recentDeposits: readonly number[]): number | null {
  if (recentDeposits.length === 0) return null;
  const window = recentDeposits.slice(-SAVINGS.estimateWindow);
  const avg = window.reduce((a, b) => a + b, 0) / window.length;
  if (avg <= 0) return null;
  return Math.ceil(remaining / avg);
}

/** Withdrawals are bounded by the pot (§3.2: Копилка ≥ 0). */
export function checkWithdrawal(pot: number, amount: number): { ok: boolean; potAfter: number } {
  if (amount < 0) throw new Error("Сумма не может быть отрицательной");
  return { ok: amount <= pot, potAfter: pot - amount };
}

export interface GoalProgress {
  achieved: boolean;
  /** The pot is unchanged: reaching the cost does not spend it. */
  potAfter: number;
  remaining: number;
}

/** When pot ≥ cost the goal is funded (`achieved`); remaining is 0; the pot stays. */
export function applyGoalProgress(pot: number, cost: number): GoalProgress {
  const remaining = Math.max(0, cost - pot);
  const achieved = pot >= cost;
  return { achieved, potAfter: pot, remaining };
}

/** Pot is always Σ('in') − Σ('out'); recompute for the invariant check. */
export function potFromTransfers(transfers: readonly { amount: number; kind: "in" | "out" }[]): number {
  return transfers.reduce((pot, t) => pot + (t.kind === "in" ? t.amount : -t.amount), 0);
}
