import { render, screen, userEvent } from "@testing-library/react-native";
import type { CatalogItem } from "../../core/economy";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { openMoney, openTab } from "../testSupport/flowHelpers";

const content = loadContent();
const lunch = content.catalog.find((item) => item.id === "lunch")!;
const candy = content.catalog.find((item) => item.id === "candy")!;
const tinyCatalog: CatalogItem[] = [lunch, candy];

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

/** Day 1: Обед 12, Конфета 5, 15 into Копилка; then day 2 opens. */
async function playDayOneThenOpenDayTwo() {
  const ports = createFakePorts();
  const profileId = seedReturningChild(ports, { unlockMoney: true });
  const day = ports.game.dayState(profileId);
  ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 12, optional: 5, savings: 15 });
  ports.game.confirmPlan(profileId, day.dayId);
  ports.game.purchase(profileId, day.dayId, lunch);
  ports.game.purchase(profileId, day.dayId, candy);
  ports.game.transferToSavings(profileId, day.dayId, 15);
  ports.game.closeDay(profileId, tinyCatalog);
  const app = await renderApp(ports);
  await app.user.press(screen.getByRole("button", { name: "Следующий день" }));
  await app.user.press(screen.getByRole("button", { name: "Понятно" }));
  return { ...app, profileId };
}

describe("Деньги tabs", () => {
  it("shows the unlocked sections as pill tabs without opening a menu", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports, { unlockMoney: true });
    const { user } = await renderApp(ports);

    await openTab(user, "Деньги");
    expect(screen.getByRole("button", { name: "Копилка" })).toBeSelected();
    expect(screen.getByRole("button", { name: "Журнал" })).not.toBeSelected();
    expect(screen.queryByRole("button", { name: "Банк" })).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Журнал" }));
    expect(screen.getByRole("button", { name: "Журнал" })).toBeSelected();
    expect(screen.getByRole("button", { name: "Всё время" })).toBeSelected();
  });
});

describe("Журнал stats", () => {
  it("switches periods and Траты / Доходы, with legend numbers and totals", async () => {
    const { user } = await playDayOneThenOpenDayTwo();
    await openMoney(user, "Журнал");

    // Всё время: both days and the start.
    expect(screen.getByText("День 2")).toBeOnTheScreen();
    expect(screen.getByText("День 1")).toBeOnTheScreen();
    expect(screen.getByText("Старт")).toBeOnTheScreen();
    expect(screen.getByLabelText("Ушло: 32 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Пришло: 140 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Итого: 108 монет")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Сегодня" }));
    expect(screen.getByRole("button", { name: "Сегодня" })).toBeSelected();
    expect(screen.getByText("День 2")).toBeOnTheScreen();
    expect(screen.queryByText("День 1")).not.toBeOnTheScreen();
    expect(screen.getByLabelText("Пособие +20")).toBeOnTheScreen();
    expect(screen.getByLabelText("Ушло: 0 монет")).toBeOnTheScreen();
    expect(screen.getByText("Здесь пока пусто")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Вчера" }));
    expect(screen.queryByText("День 2")).not.toBeOnTheScreen();
    expect(screen.getByText("День 1")).toBeOnTheScreen();
    expect(screen.getByText("Старт")).toBeOnTheScreen();
    expect(screen.getByLabelText("Покупка: Обед -12")).toBeOnTheScreen();
    expect(screen.getByLabelText("Обязательное: 12 монет, 37%")).toBeOnTheScreen();
    expect(screen.getByLabelText("Желаемое: 5 монет, 16%")).toBeOnTheScreen();
    expect(screen.getByLabelText("Копилка: 15 монет, 47%")).toBeOnTheScreen();
    expect(
      screen.getByRole("img", {
        name: "Траты, Вчера: Обязательное 12 монет, 37%; Желаемое 5 монет, 16%; Копилка 15 монет, 47%",
      }),
    ).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Доходы" }));
    expect(screen.getByRole("button", { name: "Доходы" })).toBeSelected();
    expect(screen.getByLabelText("Пособие: 20 монет, 17%")).toBeOnTheScreen();
    expect(screen.getByLabelText("Стартовый бюджет: 100 монет, 83%")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Обязательное: 12 монет, 37%")).not.toBeOnTheScreen();
    expect(screen.getByLabelText("Пришло: 120 монет")).toBeOnTheScreen();
  });
});

describe("План yesterday", () => {
  it("shows what went to each bucket yesterday next to today's draft", async () => {
    const { user } = await playDayOneThenOpenDayTwo();
    await openMoney(user, "План");

    expect(screen.getByText("Вчера: 12")).toBeOnTheScreen();
    expect(screen.getByText("Вчера: 15")).toBeOnTheScreen();
    expect(screen.getByText("Вчера: 5")).toBeOnTheScreen();
    expect(screen.getByText("Сегодня на 15 меньше, чем вчера")).toBeOnTheScreen();
    expect(screen.getByText("Сегодня на 5 меньше, чем вчера")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
    expect(screen.getByText("Сегодня на 14 меньше, чем вчера")).toBeOnTheScreen();
    expect(screen.getByLabelText(/^Копилка: 1 монет, \d+%$/)).toBeOnTheScreen();
    expect(screen.getByRole("img", { name: /^План на сегодня: .*Копилка 1 монет/ })).toBeOnTheScreen();
  });
});

describe("Копилка stats", () => {
  it("sums deposits and lists Копилка moves", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports, { unlockMoney: true });
    const day = ports.game.dayState(profileId);
    ports.game.transferToSavings(profileId, day.dayId, 15);
    ports.game.transferToSavings(profileId, day.dayId, 5);
    ports.game.withdrawFromSavings(profileId, day.dayId, 4);
    const { user } = await renderApp(ports);

    await openMoney(user, "Копилка");
    expect(screen.getByLabelText("В копилке 16")).toBeOnTheScreen();
    expect(screen.getByLabelText("Отложено всего: 20 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Взносов: 2 раза")).toBeOnTheScreen();
    expect(screen.getByLabelText("В среднем за раз: 10 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Снятие, День 1, -4 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Пополнение, День 1, +15 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText("Цель: собрано 16 из 90, 17%")).toBeOnTheScreen();
  });
});
