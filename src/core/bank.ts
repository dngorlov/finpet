import { BANK } from "./config";

export interface DepositOffer {
  id: string;
  days: number;
  ratePercent: number;
}

/** Interest in whole coins, rounded down so the bank never pays a fraction. */
export function depositInterest(amount: number, ratePercent: number): number {
  return Math.floor((amount * ratePercent) / 100);
}

/** What comes back to Баланс at the end of the term. */
export function depositPayout(amount: number, ratePercent: number): number {
  return amount + depositInterest(amount, ratePercent);
}

/** Игровой день on which the вклад returns (opened on day n for `days` days). */
export function maturesOnDay(openedDayN: number, days: number): number {
  return openedDayN + days;
}

export type DepositCheck = { status: "ok" } | { status: "tooSmall"; min: number } | { status: "blocked"; missing: number };

/** A вклад needs at least the minimum and never pushes Баланс below zero. */
export function checkDeposit(balance: number, amount: number, min: number = BANK.minDeposit): DepositCheck {
  if (amount < min) return { status: "tooSmall", min };
  if (amount > balance) return { status: "blocked", missing: amount - balance };
  return { status: "ok" };
}

export function findOffer(offerId: string): DepositOffer {
  const offer = BANK.offers.find((item) => item.id === offerId);
  if (!offer) throw new Error(`Нет вклада ${offerId}`);
  return offer;
}
