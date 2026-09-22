import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("Копилка", () => {
  it("deposits toward the active Цель and leaves an empty estimate until the first transfer", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Копилка" }));
    expect(screen.getByText("В копилке 0")).toBeOnTheScreen();
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("90 монет")).toBeOnTheScreen();
    expect(screen.getByText(stringsDash())).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Положить" }));
    await user.press(screen.getByRole("button", { name: "Сумма, больше" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));

    expect(screen.getByText("Баланс -1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    expect(screen.queryByText(/Настроение/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByText(stringsDash())).not.toBeOnTheScreen();
    expect(screen.getByText(/примерно 89/)).toBeOnTheScreen();
    expect(screen.getByText("В копилке 1")).toBeOnTheScreen();
    expect(screen.getByLabelText("Баланс 109")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("button", { name: "Копилка" })).toBeOnTheScreen();
    expect(screen.getByText("1")).toBeOnTheScreen();
    expect(screen.getByText("1 / 90")).toBeOnTheScreen();
    expect(screen.getByLabelText("Баланс 109")).toBeOnTheScreen();
    expect(screen.queryByLabelText("Баланс 1")).not.toBeOnTheScreen();
  });

  it("withdraws through a preview and a second confirm", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.transferToSavings(profileId, day.dayId, 15);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Копилка" }));
    await user.press(screen.getByRole("button", { name: "Забрать" }));
    await user.press(screen.getByRole("button", { name: "Сумма, больше" }));
    await user.press(screen.getByRole("button", { name: "Забрать" }));
    expect(screen.getByText(/В копилке станет 14/)).toBeOnTheScreen();
    expect(screen.getByText(/Мечта отодвинется/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Забрать 1?" }));

    expect(screen.getByText("Баланс +1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка -1")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByText("В копилке 14")).toBeOnTheScreen();
  });

  it("celebrates funding without mood and lets Купить из копилки or Позже", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.transferToSavings(profileId, day.dayId, 89);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Копилка" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));
    await user.press(screen.getByRole("button", { name: "Сумма, больше" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));

    expect(screen.getByText(/Мечта сбылась/)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Купить из копилки" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Позже" })).toBeOnTheScreen();
    expect(screen.queryByText("Настроение +10")).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Выбрать новую цель" })).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Позже" }));
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("осталось 0")).toBeOnTheScreen();
    expect(screen.getByText("В копилке 90")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Купить из копилки" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Купить из копилки" }));
    expect(screen.getByText("Настроение +12")).toBeOnTheScreen();
    expect(screen.getByText("Копилка -90")).toBeOnTheScreen();
    expect(screen.queryByText(/Баланс/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    expect(screen.getByRole("button", { name: "Выбрать новую цель" })).toBeOnTheScreen();
    expect(screen.getByText("В копилке 0")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Выбрать новую цель" }));
    expect(screen.getByRole("button", { name: "Телескоп" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Телескоп" }));
    expect(screen.getByText("Телескоп")).toBeOnTheScreen();
    expect(screen.getByText("160 монет")).toBeOnTheScreen();
  });
});

function stringsDash() {
  return "—";
}
