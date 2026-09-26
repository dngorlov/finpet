import { dailyRewardCalendar, dailyRewardReady, nextDailyRewardCoins } from "../dailyReward";

describe("Ежедневный подарок", () => {
  it("offers the first step before anything is claimed", () => {
    const cells = dailyRewardCalendar({ claimed: 0, claimedOn: null }, "2026-09-19");
    expect(cells.map((cell) => cell.status)).toEqual([
      "current",
      "locked",
      "locked",
      "locked",
      "locked",
      "locked",
      "locked",
    ]);
    expect(cells[0]).toMatchObject({ day: 1, coins: 5, status: "current" });
    expect(nextDailyRewardCoins(0)).toBe(5);
  });

  it("keeps the next unclaimed step when calendar days have passed", () => {
    const record = { claimed: 2, claimedOn: "2026-09-19" };
    expect(dailyRewardReady(record, "2026-09-19")).toBe(false);
    expect(dailyRewardReady(record, "2026-09-21")).toBe(true);
    const cells = dailyRewardCalendar(record, "2026-09-21");
    expect(cells.map((cell) => cell.status)).toEqual([
      "claimed",
      "claimed",
      "current",
      "locked",
      "locked",
      "locked",
      "locked",
    ]);
    expect(cells[2]).toMatchObject({ coins: 10, status: "current" });
    expect(nextDailyRewardCoins(2)).toBe(10);
  });

  it("starts the next round after the last step", () => {
    const cells = dailyRewardCalendar({ claimed: 7, claimedOn: "2026-09-25" }, "2026-09-26");
    expect(cells[0]).toMatchObject({ status: "current", coins: 5 });
    expect(cells.slice(1).every((cell) => cell.status === "locked")).toBe(true);
    expect(nextDailyRewardCoins(7)).toBe(5);
  });
});
