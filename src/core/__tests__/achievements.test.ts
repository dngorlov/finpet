import { earnedAchievementIds, emptyAchievementFacts } from "../achievements";

describe("достижения", () => {
  it("starts with nothing earned", () => {
    expect(earnedAchievementIds(emptyAchievementFacts())).toEqual([]);
  });

  it("earns a shop, a lunch, and a treat from those buys", () => {
    expect(earnedAchievementIds(emptyAchievementFacts({ shopBuys: 1 }))).toEqual(["first_buy"]);
    expect(
      earnedAchievementIds(emptyAchievementFacts({ shopBuys: 1, lunchBuys: 1, optionalBuys: 1 })),
    ).toEqual(["first_buy", "lunch", "treat"]);
  });

  it("counts 50 coins put into Копилка, and keeps the first deposit before that", () => {
    expect(earnedAchievementIds(emptyAchievementFacts({ savingsIns: 1, savedTotal: 49 }))).toEqual(["first_save"]);
    expect(earnedAchievementIds(emptyAchievementFacts({ savingsIns: 1, savedTotal: 50 }))).toEqual([
      "first_save",
      "save_50",
    ]);
  });

  it("earns the week only after seven closed days, and Про stays earned at Миллионер", () => {
    expect(earnedAchievementIds(emptyAchievementFacts({ daysClosed: 1 }))).toEqual(["day_done"]);
    expect(earnedAchievementIds(emptyAchievementFacts({ daysClosed: 7 }))).toEqual(["day_done", "week"]);
    expect(earnedAchievementIds(emptyAchievementFacts({ stage: "pro" }))).toEqual(["pro"]);
    expect(earnedAchievementIds(emptyAchievementFacts({ stage: "millionaire" }))).toEqual(["pro", "millionaire"]);
  });
});
