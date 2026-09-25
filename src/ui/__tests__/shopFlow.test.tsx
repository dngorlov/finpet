import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { openMoney } from "../testSupport/flowHelpers";

const content = loadContent();
const lunch = content.catalog.find((item) => item.id === "lunch")!;
const candy = content.catalog.find((item) => item.id === "candy")!;
const cinema = content.catalog.find((item) => item.id === "cinema")!;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("Магазин", () => {
  it("buys a mandatory item, shows FeedbackCard, and updates Main", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    expect(screen.getByRole("button", { name: "Обязательное" })).toBeSelected();
    expect(
      screen.getByRole("button", {
        name: "Обед. 12 монет. Сытость +10. Настроение +5. Если не купить Обед, Сытость −15",
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", {
        name: "Проезд. 8 монет. Настроение +5. Если не купить Проезд, Настроение −15 один раз",
      }),
    ).toBeOnTheScreen();
    expect(
      screen.getByRole("button", { name: "Школьные принадлежности. 10 монет. Настроение +5" }),
    ).toBeOnTheScreen();
    expect(screen.getAllByText("−15", { includeHiddenElements: true })).toHaveLength(2);
    expect(screen.getByText("🍱", { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.queryByText("Счёт")).not.toBeOnTheScreen();
    expect(screen.queryByText("монет")).not.toBeOnTheScreen();
    expect(screen.queryByText("Обязательные")).not.toBeOnTheScreen();
    expect(screen.queryByText(/после покупки/)).not.toBeOnTheScreen();
    expect(screen.getByText("12")).toHaveStyle({ fontFamily: "PressStart2P_400Regular" });

    await user.press(screen.getByRole("button", { name: /^Обед/ }));
    expect(screen.getByText(lunch.description)).toBeOnTheScreen();
    expect(screen.getByLabelText("Сытость +10")).toBeOnTheScreen();
    expect(screen.getByLabelText("Если не купить Обед, Сытость −15")).toBeOnTheScreen();
    expect(screen.getByText("после покупки: 108 монет")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Купить Обед за 12?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Купить" }));

    expect(screen.getByText("Баланс -12")).toBeOnTheScreen();
    expect(screen.getByText("Сытость +10")).toBeOnTheScreen();
    expect(screen.getByText("Настроение +5")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByText("Куплено", { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByLabelText("Баланс 108")).toBeOnTheScreen();
    expect(screen.getByLabelText("Сытость 60")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByLabelText("Баланс 108")).toBeOnTheScreen();
    expect(screen.getByLabelText("Сытость 60")).toBeOnTheScreen();
  });

  it("buys an optional item from the Желаемое tab", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: new RegExp(`^${candy.name}`) }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Баланс -5")).toBeOnTheScreen();
    expect(screen.getByText("Настроение +5")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByLabelText("Баланс 115")).toBeOnTheScreen();
    expect(screen.getByLabelText("Настроение 55")).toBeOnTheScreen();
  });

  it("labels one-shot Желаемые while they remain on the shelf", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    expect(screen.getByRole("button", { name: /^Скейтборд/ })).toBeOnTheScreen();
    expect(screen.getAllByText("Один раз", { includeHiddenElements: true }).length).toBeGreaterThanOrEqual(3);
    expect(screen.queryByText("Можно купить один раз")).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: /^Скейтборд/ }));
    expect(screen.getByText("Можно купить один раз")).toBeOnTheScreen();
    expect(screen.getByText("Цель")).toBeOnTheScreen();
  });

  it("blocks Игрушка when short of coins and offers Сделать целью", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, candy);
    ports.game.purchase(profileId, day.dayId, candy);
    ports.game.purchase(profileId, day.dayId, candy);
    ports.game.purchase(profileId, day.dayId, candy);
    const { user } = await renderApp(ports);

    expect(ports.game.getProfile(profileId).balance).toBe(20);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: /^Игрушка/ }));
    expect(screen.queryByRole("button", { name: "Купить" })).not.toBeOnTheScreen();
    expect(screen.getByText("Не хватает 5")).toBeOnTheScreen();
    expect(ports.game.getProfile(profileId).balance).toBe(20);

    await user.press(screen.getByRole("button", { name: "Дождаться пособия" }));
    expect(screen.getByText(/Пособие придёт/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Сделать целью" }));
    expect(screen.getByText(/Цель станет Игрушка/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Сделать целью" }));
    expect(ports.game.savingsState(profileId).activeGoal?.key).toBe("toy");
    expect(screen.getByRole("button", { name: /^Игрушка/ })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: /^Игрушка/ }));
    expect(screen.queryByRole("button", { name: "Купить" })).not.toBeOnTheScreen();
    expect(screen.getByText("Это уже твоя Цель. Копи дальше в Копилке.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Выполнить задание" }));
    expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
  });

  it("buys the funded Цель from the Магазин sheet and counts only dream buys", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.transferToSavings(profileId, day.dayId, 90);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: /^Скейтборд/ }));
    const payNames = screen.getAllByRole("button").map((node) => String(node.props.accessibilityLabel ?? ""));
    expect(payNames.indexOf("Купить из копилки")).toBeGreaterThan(payNames.indexOf("Купить"));
    await user.press(screen.getByRole("button", { name: "Купить из копилки" }));
    expect(screen.getByText("Настроение +12")).toBeOnTheScreen();
    expect(screen.getByText("Копилка -90")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByRole("button", { name: "Выбрать новую цель" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: /^Скейтборд/ })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));
    await openMoney(user, "Журнал");
    expect(screen.getByText("Покупка: Скейтборд -90")).toBeOnTheScreen();

    ports.game.closeDay(profileId, content.catalog);
    await user.press(screen.getByRole("button", { name: "Дом" }));
    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(screen.getByText("Целей: 1")).toBeOnTheScreen();
  });

  it("does not count an impulse one-shot that was not the Цель", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    ports.game.clearActiveGoal(profileId);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: /^Скейтборд/ }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Настроение +12")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByRole("button", { name: /^Скейтборд/ })).not.toBeOnTheScreen();

    ports.game.closeDay(profileId, content.catalog);
    await user.press(screen.getByRole("button", { name: "Назад" }));
    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(screen.getByText("Целей: 0")).toBeOnTheScreen();
  });

  it("counts Конфета when it was bought as the Цель", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const { user } = await renderApp(ports);

    ports.game.clearActiveGoal(profileId);
    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: new RegExp(`^${candy.name}`) }));
    await user.press(screen.getByRole("button", { name: "Сделать целью" }));
    expect(screen.queryByText(/Цель станет/)).not.toBeOnTheScreen();
    expect(ports.game.savingsState(profileId).activeGoal?.key).toBe(candy.id);
    await user.press(screen.getByRole("button", { name: new RegExp(`^${candy.name}`) }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Настроение +5")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    ports.game.closeDay(profileId, content.catalog);
    await user.press(screen.getByRole("button", { name: "Назад" }));
    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(screen.getByText("Целей: 1")).toBeOnTheScreen();
  });
});
