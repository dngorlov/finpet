/**
 * Every engine constant in one place (ROADMAP §10): tuning happens here or in
 * assets/content — never scattered across modules.
 */
export const ECONOMY = {
  /** Стартовый бюджет: granted once at profile creation (§2.1). */
  startingBudget: 100,
  /** Пособие: +10 on first open of each new Игровой день (§2.1). */
  allowance: 10,
  /** Задание reward: first correct completion only (§2.1). */
  taskReward: 10,
} as const;

export const METERS = {
  min: 0,
  max: 100,
  /** Initial meter values at profile creation (not settled in ROADMAP; midpoint chosen). */
  initialCare: 50,
  initialMood: 50,
  /** Забота penalty when a day closes with an unpurchased mandatory item (§2.2). */
  missedMandatoryCarePenalty: 15,
  /** Настроение penalty when actual optional spend exceeds the plan bucket (§2.2). */
  overspendMoodPenalty: 5,
} as const;

export const STAGES = {
  /** Rolling window of closed days the stage is computed over (§2.2). */
  window: 3,
  /** Thresholds on the rolling sum: <3 Новичок, 3–8 Друг, ≥9 Мастер. */
  friendAt: 3,
  masterAt: 9,
} as const;

export const SAVINGS = {
  /** How many recent deposits feed the rolling average for the date estimate (§2.1). */
  estimateWindow: 5,
} as const;
