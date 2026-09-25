import { render, screen, userEvent } from "@testing-library/react-native";
import { META_KEYS } from "../../data/metaKeys";
import { FinPetApp } from "../FinPetApp";
import {
  confirmActiveDayPlan,
  createFakePorts,
  seedReturningChild,
} from "../testSupport/fakePorts";
import { loadContent } from "../../data/content";
import { confirmTinyPlan, demoMissions, openMoney, openTab, passAdultGate } from "../testSupport/flowHelpers";

const content = loadContent();

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

async function closeDemoDayAndAdvance(
  user: ReturnType<typeof userEvent.setup>,
  ports: ReturnType<typeof createFakePorts>,
) {
  confirmActiveDayPlan(ports);
  const demoId = ports.meta.get(META_KEYS.activeProfileId)!;
  await user.press(screen.getByRole("button", { name: "Настройки" }));
  ports.game.closeDay(demoId, content.catalog, content.bills);
  await user.press(screen.getByRole("button", { name: "Назад" }));
  expect(screen.getByText("Пособие +20 монет")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Понятно" }));
}

describe("Итоги дня + Демо-режим combined loop", () => {
  it(
    "closes a confirmed day, waits on Main, then walks five demo days, reset, and exit",
    async () => {
      const ports = createFakePorts();
      const childId = seedReturningChild(ports);
      const childDay = ports.game.dayState(childId);
      expect(ports.game.claimTaskReward(childId, childDay.dayId, "budget_what", 10)).toBe(10);
      const { user } = await renderApp(ports);

      await confirmTinyPlan(user);
      await user.press(screen.getByRole("button", { name: "Настройки" }));
      ports.game.closeDay(childId, content.catalog, content.bills);
      await user.press(screen.getByRole("button", { name: "Назад" }));

      expect(screen.getByText("Новый день откроется завтра")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Магазин" })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Закончить день" })).not.toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Итоги" }));
      expect(screen.getByText("план 21 · потрачено 0")).toBeOnTheScreen();
      expect(screen.getAllByText("план 1 · потрачено 0")).toHaveLength(2);
      expect(screen.getByText("Обязательные 0")).toBeOnTheScreen();
      expect(screen.getByText("По плану 0")).toBeOnTheScreen();
      expect(screen.getByText("Копилка 0")).toBeOnTheScreen();
      expect(screen.getByText("Забота -15: пропущены обязательные расходы")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
      await openTab(user, "Дом");

      const childAfterClose = ports.game.getProfile(childId);
      const childTasksAfterClose = ports.game.listTaskProgress(childId);
      const childClosed = ports.game.lastClosedDay(childId);
      expect(childAfterClose.balance).toBe(130);
      expect(childClosed?.n).toBe(1);
      expect(ports.game.dayState(childId).open).toBe(false);

      await passAdultGate(user);
      await user.press(screen.getByRole("button", { name: "Демо-режим" }));
      expect(screen.getByText("Демо создаёт отдельный тестовый профиль")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Готово" }));
      await user.press(screen.getByRole("button", { name: "Понятно" }));

      expect(screen.getByText("Демо: дни идут подряд")).toBeOnTheScreen();
      expect(screen.queryByText("Охота за ценником")).not.toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Что такое бюджет?")).toBeOnTheScreen();
      for (const title of demoMissions) {
        expect(screen.getByRole("button", { name: `${title}, открыто` })).toBeOnTheScreen();
      }
      await openTab(user, "Дом");

      await closeDemoDayAndAdvance(user, ports);
      const demoId = ports.meta.get(META_KEYS.activeProfileId)!;
      const closedActuals = ports.game.lastClosedDay(demoId)?.actual;
      expect(closedActuals).toEqual({ mandatory: 0, optional: 0, savings: 0 });
      await openMoney(user, "План");
      expect(screen.getAllByText("вчера 0")).toHaveLength(3);
      await openTab(user, "Дом");

      for (let n = 1; n < 5; n += 1) {
        await closeDemoDayAndAdvance(user, ports);
      }

      expect(ports.game.lastClosedDay(demoId)?.n).toBe(5);
      expect(ports.game.dayState(demoId).n).toBe(6);

      await user.press(screen.getByRole("button", { name: "Итоги" }));
      expect(screen.getByText("Игровой день 5")).toBeOnTheScreen();
      expect(screen.getByText("Игровых дней: 5")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await passAdultGate(user);
      await user.press(screen.getByRole("button", { name: "Сбросить демо" }));
      expect(screen.getByText("Демо вернётся к первому игровому дню")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Готово" }));
      await user.press(screen.getByRole("button", { name: "Понятно" }));

      expect(screen.getByText("Демо: дни идут подряд")).toBeOnTheScreen();
      expect(screen.getByLabelText("Этап Новичок")).toBeOnTheScreen();
      expect(screen.getByLabelText("Баланс 120")).toBeOnTheScreen();
      expect(screen.queryByText("Охота за ценником")).not.toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Что такое бюджет?")).toBeOnTheScreen();
      for (const title of demoMissions) {
        expect(screen.getByRole("button", { name: `${title}, открыто` })).toBeOnTheScreen();
      }
      await openTab(user, "Дом");

      await openMoney(user, "Журнал");
      expect(screen.getByText("Стартовый бюджет +100")).toBeOnTheScreen();
      expect(screen.getByText("Пособие +20")).toBeOnTheScreen();
      expect(screen.getByText("День 1")).toBeOnTheScreen();
      expect(screen.queryByText("День 2")).not.toBeOnTheScreen();
      expect(screen.queryByText("День 5")).not.toBeOnTheScreen();
      await openTab(user, "Дом");

      await passAdultGate(user);
      await user.press(screen.getByRole("button", { name: "Демо-режим" }));

      expect(screen.getByText("Новый день откроется завтра")).toBeOnTheScreen();
      expect(screen.getByLabelText("Баланс 130")).toBeOnTheScreen();
      expect(screen.queryByText("Демо: дни идут подряд")).not.toBeOnTheScreen();
      expect(ports.game.getProfile(childId)).toEqual(childAfterClose);
      expect(ports.game.listTaskProgress(childId)).toEqual(childTasksAfterClose);
      expect(ports.game.dayState(childId).open).toBe(false);
      expect(ports.game.lastClosedDay(childId)?.n).toBe(1);
    },
    60000,
  );
});
