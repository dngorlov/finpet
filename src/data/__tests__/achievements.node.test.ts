import type { CatalogItem } from "../../core/economy";
import { openMemoryGame } from "../testSupport/memoryDb";

const lunch: CatalogItem = {
  id: "lunch",
  kind: "mandatory",
  price: 12,
  effect: { meter: "care", delta: 10 },
};

describe("достижения", () => {
  it("records a shop buy on that Игровой день and dismisses one reward at a time", () => {
    const { game } = openMemoryGame();
    const profileId = game.createProfile({
      name: "Миша",
      species: "sp1",
      color: "c1",
      accessory: "a1",
      petName: "Пух",
      contentVersion: 1,
      goals: [{ key: "skateboard", cost: 90 }],
      activeGoalKey: "skateboard",
    });
    const opened = game.openDay(profileId);
    if (opened.status !== "opened") throw new Error("День не открылся");

    expect(game.listAchievements(profileId)).toEqual([]);
    game.purchase(profileId, opened.dayId, lunch);

    expect(game.listAchievements(profileId)).toEqual([
      { id: "first_buy", dayN: 1, celebrated: false },
      { id: "lunch", dayN: 1, celebrated: false },
    ]);

    game.celebrateAchievement(profileId, "first_buy");
    expect(game.listAchievements(profileId)).toEqual([
      { id: "first_buy", dayN: 1, celebrated: true },
      { id: "lunch", dayN: 1, celebrated: false },
    ]);
  });
});
