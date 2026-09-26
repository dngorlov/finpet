/**
 * Ежедневный подарок: one step per real local day. A missed day does not
 * move the place backward or forward. After the last step the track repeats.
 */
export const DAILY_REWARD_COINS = [5, 5, 10, 10, 15, 15, 20] as const;

export type DailyRewardStatus = "claimed" | "current" | "locked";

export type DailyRewardCell = {
  /** 1-based place in the current round. */
  day: number;
  coins: number;
  status: DailyRewardStatus;
};

export type DailyRewardRecord = {
  /** Gifts taken so far. A missed calendar day does not change this. */
  claimed: number;
  /** Local date YYYY-MM-DD of the last claim, or null before the first. */
  claimedOn: string | null;
};

export type DailyRewardView = {
  ready: boolean;
  cells: DailyRewardCell[];
};

export type ClaimDailyRewardResult = { status: "ok"; coins: number } | { status: "already" };

/** True when this local date has not claimed yet. */
export function dailyRewardReady(record: DailyRewardRecord, today: string): boolean {
  return record.claimedOn !== today;
}

/** Coins for the next claim. The place is how many were claimed, not how many days passed. */
export function nextDailyRewardCoins(claimed: number): number {
  const coins = DAILY_REWARD_COINS[claimed % DAILY_REWARD_COINS.length];
  return coins ?? DAILY_REWARD_COINS[0];
}

/**
 * One round. Steps before the next claim are ticked, the next one is current
 * when a gift is ready, and the rest stay locked. A finished round shows the
 * next round with nothing ticked.
 */
export function dailyRewardCalendar(record: DailyRewardRecord, today: string): DailyRewardCell[] {
  const ready = dailyRewardReady(record, today);
  const next = record.claimed % DAILY_REWARD_COINS.length;
  return DAILY_REWARD_COINS.map((coins, index) => {
    let status: DailyRewardStatus = "locked";
    if (ready && index === next) status = "current";
    else if (index < next) status = "claimed";
    return { day: index + 1, coins, status };
  });
}
