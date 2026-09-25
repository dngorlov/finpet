/**
 * Clock port: timestamps go through here so tests can inject a fake.
 * Opening the next Игровой день does not consult the clock (ADR-0007).
 */
export interface Clock {
  /** Current instant. */
  now(): Date;
  /** True when the Игровой день after `lastClosedAt` may open (§2.1 day rules). */
  isNextDayUnlocked(lastClosedAt: Date, isDemo: boolean): boolean;
}

/** Local calendar date (YYYY-MM-DD) of a moment — day boundaries are local midnight. */
export function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }

  isNextDayUnlocked(lastClosedAt: Date, isDemo: boolean): boolean {
    return nextDayUnlocked(this.now(), lastClosedAt, isDemo);
  }
}

export class ManualClock implements Clock {
  constructor(private current: Date) {}

  now(): Date {
    return this.current;
  }

  isNextDayUnlocked(_lastClosedAt?: Date, _isDemo?: boolean): boolean {
    return true;
  }

  /** Advance to the next local midnight — the Демо-режим "Следующий день". */
  advanceDay(): void {
    const next = new Date(this.current);
    next.setDate(next.getDate() + 1);
    next.setHours(0, 0, 0, 0);
    this.current = next;
  }
}

/** Pure unlock rule used by both clocks (normal play = calendar day changed). */
export function nextDayUnlocked(now: Date, lastClosedAt: Date, isDemo: boolean): boolean {
  if (isDemo) return true;
  return localDate(lastClosedAt) < localDate(now);
}
