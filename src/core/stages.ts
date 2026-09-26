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

/** Cheapest preset Цель of an Этап. A Своя цель below this is too cheap to advance alone. */
export function stageGoalFloor(prices: readonly number[]): number {
  if (prices.length === 0) throw new Error("У этапа нет целей");
  return Math.min(...prices);
}

/**
 * A preset, or a Своя цель at or above the Порог, advances one step and clears
 * the running sum. A cheaper Своя цель adds its price; the step happens only
 * when that sum reaches the Порог. Миллионер has no next step.
 */
export function applyStageStep(input: {
  stage: Stage;
  custom: boolean;
  price: number;
  threshold: number;
  credit: number;
}): { stage: Stage; credit: number } {
  if (nextStage(input.stage) === input.stage) {
    return { stage: input.stage, credit: input.credit };
  }
  if (!input.custom || input.price >= input.threshold) {
    return { stage: nextStage(input.stage), credit: 0 };
  }
  const credit = input.credit + input.price;
  if (credit >= input.threshold) {
    return { stage: nextStage(input.stage), credit: 0 };
  }
  return { stage: input.stage, credit };
}

/** The Порог is visible only for a Своя цель cheaper than it, and only when a next Этап exists. */
export function showStageThreshold(input: {
  stage: Stage;
  custom: boolean;
  price: number;
  threshold: number;
}): boolean {
  if (!input.custom || nextStage(input.stage) === input.stage) return false;
  return input.price < input.threshold;
}

/** Said on Копилка when a purchase moves Этап. A step that stays put says nothing. */
export function explainStageChange(from: Stage, to: Stage): string | null {
  if (from === to) return null;
  if (to === "pro") return "Теперь ты Про!";
  if (to === "millionaire") return "Теперь ты Миллионер!";
  return null;
}
