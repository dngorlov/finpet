import { ManualClock, localDate, nextDayUnlocked } from "../clock";

describe("nextDayUnlocked", () => {
  const closedMonday = new Date(2026, 8, 14, 21, 0, 0);

  it("stays locked on the same local calendar day in normal play", () => {
    const stillMonday = new Date(2026, 8, 14, 23, 59, 0);
    expect(nextDayUnlocked(stillMonday, closedMonday, false)).toBe(false);
  });

  it("unlocks at local midnight of the next calendar day in normal play", () => {
    const tuesday = new Date(2026, 8, 15, 0, 0, 0);
    expect(nextDayUnlocked(tuesday, closedMonday, false)).toBe(true);
  });

  it("is always unlocked in Демо-режим", () => {
    const stillMonday = new Date(2026, 8, 14, 21, 5, 0);
    expect(nextDayUnlocked(stillMonday, closedMonday, true)).toBe(true);
  });
});

describe("ManualClock", () => {
  it("always reports the next day unlocked so demo days can run back-to-back", () => {
    const clock = new ManualClock(new Date(2026, 8, 14, 12, 0, 0));
    const closedAt = clock.now();

    expect(clock.isNextDayUnlocked(closedAt, false)).toBe(true);

    clock.advanceDay();
    expect(localDate(clock.now())).toBe("2026-09-15");
    expect(clock.isNextDayUnlocked(closedAt, false)).toBe(true);
  });
});
