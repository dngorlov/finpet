import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

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
    expect(screen.getByRole("button", { name: "Обед" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Обед" }));
    expect(screen.getByText(lunch.description)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Купить Обед за 12?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Купить" }));

    expect(screen.getByText("Баланс -12")).toBeOnTheScreen();
    expect(screen.getByText("Забота +10")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByText("Куплено")).toBeOnTheScreen();
    expect(screen.getByLabelText("Баланс 98")).toBeOnTheScreen();
    expect(screen.getByLabelText("Забота 60")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByLabelText("Баланс 98")).toBeOnTheScreen();
    expect(screen.getByText("Забота 60")).toBeOnTheScreen();
  });

  it("buys an optional item from the Желаемое tab", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: candy.name }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Баланс -5")).toBeOnTheScreen();
    expect(screen.getByText("Настроение +5")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByLabelText("Баланс 105")).toBeOnTheScreen();
    expect(screen.getByText("Настроение 55")).toBeOnTheScreen();
  });

  it("labels one-shot Желаемые while they remain on the shelf", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    expect(screen.getByRole("button", { name: "Скейтборд" })).toBeOnTheScreen();
    expect(screen.getAllByText("Можно купить один раз").length).toBeGreaterThanOrEqual(3);
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
    const { user } = await renderApp(ports);

    expect(ports.game.getProfile(profileId).balance).toBe(20);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: "Игрушка" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));

    expect(screen.getByText("Не хватает 5 монет")).toBeOnTheScreen();
    expect(ports.game.getProfile(profileId).balance).toBe(20);

    await user.press(screen.getByRole("button", { name: "Дождаться пособия" }));
    expect(screen.getByText(/Пособие придёт/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Сделать целью" }));
    expect(screen.getByText(/Цель станет Игрушка/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Сделать целью" }));
    expect(ports.game.savingsState(profileId).activeGoal?.key).toBe("toy");
    expect(screen.getByRole("button", { name: "Игрушка" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Игрушка" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Это уже твоя Цель. Копи дальше в Копилке.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Выполнить задание" }));
    expect(screen.getByText("Бюджет")).toBeOnTheScreen();
  });
});
