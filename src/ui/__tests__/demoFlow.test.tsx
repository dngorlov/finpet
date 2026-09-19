import { render, screen, userEvent } from "@testing-library/react-native";
import type { CatalogItem } from "../../core/economy";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const lunch: CatalogItem = {
  id: "lunch",
  kind: "mandatory",
  price: 12,
  effect: { meter: "care", delta: 10 },
};
const candy: CatalogItem = {
  id: "candy",
  kind: "optional",
  price: 5,
  effect: { meter: "mood", delta: 5 },
};
const tinyCatalog: CatalogItem[] = [lunch, candy];

const sixUnlocked = [
  "Первый план",
  "Сломался рюкзак",
  "Копилка мечты",
  "Большая распродажа",
  "Две цены",
  "Чек",
] as const;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

async function confirmDemo(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
  await user.press(screen.getByRole("button", { name: "Демо-режим" }));
  expect(screen.getByText("Демо создаёт отдельный тестовый профиль")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Готово" }));
  await user.press(screen.getByRole("button", { name: "Понятно" }));
}

function expectUnlockedTitles() {
  for (const title of sixUnlocked) {
    expect(screen.getByText(title)).toBeOnTheScreen();
  }
  expect(screen.queryByText("Почини рюкзак")).not.toBeOnTheScreen();
}

describe("Демо-режим panel", () => {
  it(
    "lets a juror enter, reset, and leave without touching the child profile",
    async () => {
      const ports = createFakePorts();
      const childId = seedReturningChild(ports);
      const childDay = ports.game.dayState(childId);
      ports.game.purchase(childId, childDay.dayId, lunch);
      ports.game.claimTaskReward(childId, childDay.dayId, "budget_first_plan", true);
      const childBefore = ports.game.getProfile(childId);
      const childTasksBefore = ports.game.listTaskProgress(childId);

      const { user } = await renderApp(ports);
      expect(screen.getByText("Баланс 108")).toBeOnTheScreen();
      expect(screen.getByText("Первый план")).toBeOnTheScreen();
      expect(screen.queryByText("Демо: дни идут подряд")).not.toBeOnTheScreen();
      expect(screen.queryByText("Две цены")).not.toBeOnTheScreen();

      await confirmDemo(user);

      expect(screen.getByText("Демо: дни идут подряд")).toBeOnTheScreen();
      expect(screen.getByText("Этап Новичок")).toBeOnTheScreen();
      expect(screen.getByText("Баланс 110")).toBeOnTheScreen();
      expect(screen.getByLabelText(/Питомец Демо/)).toBeOnTheScreen();
      expectUnlockedTitles();
      expect(ports.game.getProfile(childId)).toEqual(childBefore);
      expect(ports.game.listTaskProgress(childId)).toEqual(childTasksBefore);

      const demoId = ports.meta.get("activeProfileId")!;
      const demoDay = ports.game.dayState(demoId);
      ports.game.saveDraftPlan(demoId, demoDay.dayId, { mandatory: 12, optional: 5, savings: 15 });
      ports.game.confirmPlan(demoId, demoDay.dayId);
      ports.game.purchase(demoId, demoDay.dayId, lunch);
      ports.game.purchase(demoId, demoDay.dayId, candy);
      ports.game.transferToSavings(demoId, demoDay.dayId, 15);
      ports.game.claimTaskReward(demoId, demoDay.dayId, "budget_first_plan", true);
      ports.game.closeDay(demoId, tinyCatalog);

      await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
      await user.press(screen.getByRole("button", { name: "Сбросить демо" }));
      await user.press(screen.getByRole("button", { name: "Понятно" }));

      expect(screen.getByText("Демо: дни идут подряд")).toBeOnTheScreen();
      expect(screen.getByText("Этап Новичок")).toBeOnTheScreen();
      expect(screen.getByText("Баланс 110")).toBeOnTheScreen();
      expectUnlockedTitles();

      await user.press(screen.getByRole("button", { name: "Прогресс" }));
      expect(screen.getByText("Стартовый бюджет +100")).toBeOnTheScreen();
      expect(screen.getByText("Пособие +10")).toBeOnTheScreen();
      expect(screen.getByText("День 1")).toBeOnTheScreen();
      expect(screen.queryByText("Покупка: Обед -12")).not.toBeOnTheScreen();
      expect(screen.queryByText("День 2")).not.toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
      await user.press(screen.getByRole("button", { name: "Демо-режим" }));

      expect(screen.getByText("Баланс 108")).toBeOnTheScreen();
      expect(screen.queryByText("Демо: дни идут подряд")).not.toBeOnTheScreen();
      expect(screen.getByLabelText(/Питомец Пух/)).toBeOnTheScreen();
      expect(screen.queryByText("Две цены")).not.toBeOnTheScreen();
      expect(ports.game.getProfile(childId)).toEqual(childBefore);
      expect(ports.game.listTaskProgress(childId)).toEqual(childTasksBefore);
    },
    15000,
  );
});
