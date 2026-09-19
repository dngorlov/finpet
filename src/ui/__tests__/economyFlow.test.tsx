import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();
const cinema = content.catalog.find((item) => item.id === "cinema")!;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("economy loop (Appendix A 5, 7–9)", () => {
  it("plans, buys, blocks a short purchase, saves, and records the Журнал", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "План" }));
    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    await user.press(screen.getByRole("button", { name: "Желаемые, больше" }));
    await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByText("План готов")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Обед" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Баланс -12")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: "Конфета" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Настроение +5")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    await user.press(screen.getByRole("button", { name: "Назад" }));

    const day = ports.game.dayState(profileId);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);
    ports.game.purchase(profileId, day.dayId, cinema);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    await user.press(screen.getByRole("button", { name: "Желаемое" }));
    await user.press(screen.getByRole("button", { name: "Игрушка" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText(/Не хватает/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Отложить" }));
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Копилка" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));
    await user.press(screen.getByRole("button", { name: "Сумма, больше" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Прогресс" }));
    expect(screen.getByText("Покупка: Обед -12")).toBeOnTheScreen();
    expect(screen.getByText("Покупка: Конфета -5")).toBeOnTheScreen();
    expect(screen.getByText("Перевод в копилку -1")).toBeOnTheScreen();
    expect(screen.getByText("Пособие +10")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByText("План готов")).toBeOnTheScreen();
    expect(screen.getByText("Копилка 1")).toBeOnTheScreen();
  });
});
