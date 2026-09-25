import { localDate } from "./clock";
import type { Clock } from "./clock";

/** Игровой день identity: profileId#n (§3.2). */
export function dayId(profileId: string, n: number): string {
  return `${profileId}#${n}`;
}

export interface DayCloseInput {
  mandatoryCovered: boolean;
  withinPlan: boolean;
  deposited: boolean;
  closedAt: Date;
}

/**
 * Retired calendar gate from ADR-0002. ADR-0007 opens the next Игровой день
 * without consulting it.
 */
export function canOpenNextDay(clock: Clock, lastClosedAt: Date | null, isDemo: boolean): boolean {
  if (lastClosedAt === null) return true;
  return clock.isNextDayUnlocked(lastClosedAt, isDemo);
}

/** True when `moment` is on a later local calendar date than `since`. */
export function isLaterLocalDay(moment: Date, since: Date): boolean {
  return localDate(since) < localDate(moment);
}
