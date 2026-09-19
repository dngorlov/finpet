import { STAGES } from "./config";

/** Этапы (R10): Новичок → Друг → Мастер. */
export type Stage = "novice" | "friend" | "master";

export const STAGE_NAMES: Record<Stage, string> = {
  novice: "Новичок",
  friend: "Друг",
  master: "Мастер",
};

/** Integer encoding stored on petState.stage (§3.2). */
export const STAGE_CODES: Record<Stage, number> = {
  novice: 0,
  friend: 1,
  master: 2,
};

export function stageFromCode(code: number): Stage {
  if (code >= STAGE_CODES.master) return "master";
  if (code >= STAGE_CODES.friend) return "friend";
  return "novice";
}

export interface DayFacts {
  /** All mandatory items purchased that day. */
  mandatoryCovered: boolean;
  /** Actual purchase spend ≤ Обязательные + Желаемые plan buckets. */
  withinPlan: boolean;
  /** Any Копилка deposit made that day. */
  deposited: boolean;
}

/** Day score: +2 mandatory covered · +1 within plan · +1 deposited (§2.2). */
export function dayScore(facts: DayFacts): number {
  return (facts.mandatoryCovered ? 2 : 0) + (facts.withinPlan ? 1 : 0) + (facts.deposited ? 1 : 0);
}

/** Stage = rolling sum over the last 3 closed days: <3 Новичок, 3–8 Друг, ≥9 Мастер. */
export function stageFromScores(closedDayScores: readonly number[]): Stage {
  const sum = closedDayScores.slice(-STAGES.window).reduce((a, b) => a + b, 0);
  if (sum >= STAGES.masterAt) return "master";
  if (sum >= STAGES.friendAt) return "friend";
  return "novice";
}

/** Kid-worded explanation emitted whenever the stage changes (§2.2). */
export function explainStageChange(from: Stage, to: Stage): string | null {
  if (from === to) return null;
  const name = STAGE_NAMES[to];
  if (to === "master") return `Ты стал(а) Мастером — ${name}! Так держать!`;
  if (to === "friend") return `Питомец доверяет тебе: теперь ты Друг!`;
  return `Ты снова Новичок — ничего страшного, попробуй ещё!`;
}
