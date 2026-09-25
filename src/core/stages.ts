/** Этапы: Новичок → Про → Миллионер. Buying the Цель is the only step. */
export type Stage = "novice" | "pro" | "millionaire";

export const STAGE_NAMES: Record<Stage, string> = {
  novice: "Новичок",
  pro: "Про",
  millionaire: "Миллионер",
};

/** Integer encoding stored on petState.stage. */
export const STAGE_CODES: Record<Stage, number> = {
  novice: 0,
  pro: 1,
  millionaire: 2,
};

export function stageFromCode(code: number): Stage {
  if (code >= STAGE_CODES.millionaire) return "millionaire";
  if (code >= STAGE_CODES.pro) return "pro";
  return "novice";
}

export function nextStage(stage: Stage): Stage {
  if (stage === "novice") return "pro";
  if (stage === "pro") return "millionaire";
  return "millionaire";
}

export interface DayFacts {
  /** All mandatory items purchased that day. */
  mandatoryCovered: boolean;
  /** Actual purchase spend ≤ Обязательные + Желаемые plan buckets. */
  withinPlan: boolean;
  /** Any Копилка deposit made that day. */
  deposited: boolean;
}

/** Kept so a closed day can still record the old checks. It does not move Этап. */
export function dayScore(facts: DayFacts): number {
  return (facts.mandatoryCovered ? 2 : 0) + (facts.withinPlan ? 1 : 0) + (facts.deposited ? 1 : 0);
}

/** Said on Копилка when a purchase moves Этап. A step that stays put says nothing. */
export function explainStageChange(from: Stage, to: Stage): string | null {
  if (from === to) return null;
  if (to === "pro") return "Теперь ты Про!";
  if (to === "millionaire") return "Теперь ты Миллионер!";
  return null;
}
