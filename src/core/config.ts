/**
 * Every engine constant in one place (ROADMAP §10): tuning happens here or in
 * assets/content — never scattered across modules.
 */
export const ECONOMY = {
  /** Стартовый бюджет: granted once at profile creation (§2.1). */
  startingBudget: 100,
  /**
   * Пособие: credited on first open of each new Игровой день (§2.1).
   * 20 so that Счета (~27/day on average, see catalog.json `bills`) plus a
   * Цель are reachable over the 5-day demo only with a kept План and Задания.
   */
  allowance: 20,
  /** Задание reward: first correct completion only (§2.1). */
  taskReward: 10,
} as const;

export const METERS = {
  min: 0,
  max: 100,
  /** Initial meter values at profile creation (not settled in ROADMAP; midpoint chosen). */
  initialCare: 50,
  initialMood: 50,
  /** Сытость penalty when a day closes with today's Обед unpaid. */
  missedFoodPenalty: 15,
  /** Настроение penalty when a day closes with another unpaid Счёт. Once, not per item. */
  missedOtherBillPenalty: 15,
  /** Настроение penalty when actual optional spend exceeds the plan bucket (§2.2). */
  overspendMoodPenalty: 5,
} as const;

export const SAVINGS = {
  /** How many recent deposits feed the rolling average for the date estimate (§2.1). */
  estimateWindow: 5,
} as const;

/**
 * Банк (вклад), separate from Копилка (2026-09-24, Александр): opens after the
 * lesson about banks; coins leave Баланс on confirm and come back with
 * interest when the term (in Игровые дни) ends. No early withdrawal.
 */
/** Lessons that open money tools. Демо-режим shows the tools without them. */
export const FEATURES = {
  savingsTaskId: "savings_what",
  planTaskId: "budget_plan",
} as const;

export const BANK = {
  /** Finishing this Задание shows the Банк tile (Демо-режим: always). */
  unlockTaskId: "savings_where",
  minDeposit: 10,
  offers: [
    { id: "short", days: 3, ratePercent: 10 },
    { id: "long", days: 5, ratePercent: 20 },
  ],
} as const;

