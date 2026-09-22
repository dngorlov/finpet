import { render, screen, userEvent } from "@testing-library/react-native";
import type { CatalogItem } from "../../core/economy";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();
const lunch = content.catalog.find((item) => item.id === "lunch")!;
const candy = content.catalog.find((item) => item.id === "candy")!;
const tinyCatalog: CatalogItem[] = [lunch, candy];

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

function closeScoredDay(ports: ReturnType<typeof createFakePorts>, profileId: string) {
  const day = ports.game.dayState(profileId);
  ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 12, optional: 5, savings: 15 });
  ports.game.confirmPlan(profileId, day.dayId);
  ports.game.purchase(profileId, day.dayId, lunch);
  ports.game.purchase(profileId, day.dayId, candy);
  ports.game.transferToSavings(profileId, day.dayId, 15);
  return ports.game.closeDay(profileId, tinyCatalog);
}

describe("Прогресс", () => {
  it("shows Журнал rows for grant, Пособие, and a purchase", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.purchase(profileId, day.dayId, lunch);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Прогресс" }));
    expect(screen.getByRole("button", { name: "Журнал" })).toBeSelected();
    expect(screen.getByText("День 1")).toBeOnTheScreen();
    expect(screen.getByText("Покупка: Обед -12")).toBeOnTheScreen();
    expect(screen.getByText("Пособие +20")).toBeOnTheScreen();
    expect(screen.getByText("Старт")).toBeOnTheScreen();
    expect(screen.getByText("Стартовый бюджет +100")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(screen.getByText("Итоги появятся после первого закрытого игрового дня.")).toBeOnTheScreen();
  });

  it("replaces empty Итоги after closeDay and labels Задание journal rows", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.applyTaskStep(profileId, day.dayId, {
      next: "exit",
      verdict: "good",
      explanation: "чек",
      effects: [{ coins: 8 }],
      spawnTask: "budget_fix_backpack",
    });
    expect(ports.game.claimTaskReward(profileId, day.dayId, "budget_first_plan", true)).toBe(10);
    expect(ports.game.claimTaskReward(profileId, day.dayId, "budget_fix_backpack", true)).toBe(10);
    closeScoredDay(ports, profileId);

    const { user } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Прогресс" }));
    expect(screen.getByText("Задание: Первый план +10")).toBeOnTheScreen();
    expect(screen.getByText("Задание +8")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(
      screen.queryByText("Итоги появятся после первого закрытого игрового дня."),
    ).not.toBeOnTheScreen();
    expect(screen.getByText("Игровой день 1")).toBeOnTheScreen();
    expect(screen.getByText("Итог 4")).toBeOnTheScreen();
    expect(screen.getByText("Обязательные +2")).toBeOnTheScreen();
    expect(screen.getByText("По плану +1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    expect(screen.getByText("план 12 · потрачено 12")).toBeOnTheScreen();
    expect(screen.getByText("план 5 · потрачено 5")).toBeOnTheScreen();
    expect(screen.getByText("план 15 · потрачено 15")).toBeOnTheScreen();
    expect(screen.getByText("Забота и настроение без изменений")).toBeOnTheScreen();
    expect(screen.getByText("Этап Друг")).toBeOnTheScreen();
    expect(screen.getByText("Питомец доверяет тебе: теперь ты Друг!")).toBeOnTheScreen();
    expect(screen.getByText("Игровых дней: 1")).toBeOnTheScreen();
    expect(screen.getByText("Задания 1/6")).toBeOnTheScreen();
    expect(screen.getByText("Целей: 0")).toBeOnTheScreen();
  });
});
