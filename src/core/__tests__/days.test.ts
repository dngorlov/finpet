import { ManualClock, nextDayUnlocked } from "../clock";
import type { Clock } from "../clock";
import { canOpenNextDay, dayId } from "../days";

class FakeClock implements Clock {
  constructor(private current: Date) {}
  now(): Date {
    return this.current;
  }
  set(next: Date): void {
    this.current = next;
  }
  isNextDayUnlocked(lastClosedAt: Date, isDemo: boolean): boolean {
    return nextDayUnlocked(this.now(), lastClosedAt, isDemo);
  }
}

describe("dayId", () => {
  it("is profileId#n", () => {
    expect(dayId("p1", 3)).toBe("p1#3");
  });
});

describe("canOpenNextDay", () => {
  it("allows the first Игровой день with no previous close", () => {
    const clock = new FakeClock(new Date(2026, 8, 14, 10, 0, 0));
    expect(canOpenNextDay(clock, null, false)).toBe(true);
  });

  it("waits for the next local calendar day in normal play", () => {
    const clock = new FakeClock(new Date(2026, 8, 14, 22, 0, 0));
    const closedAt = new Date(2026, 8, 14, 21, 0, 0);

    expect(canOpenNextDay(clock, closedAt, false)).toBe(false);

    clock.set(new Date(2026, 8, 15, 0, 0, 0));
    expect(canOpenNextDay(clock, closedAt, false)).toBe(true);
  });

  it("opens the next day immediately under a ManualClock", () => {
    const clock = new ManualClock(new Date(2026, 8, 14, 12, 0, 0));
    const closedAt = clock.now();

    expect(canOpenNextDay(clock, closedAt, false)).toBe(true);
  });
});
