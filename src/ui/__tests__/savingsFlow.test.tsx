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
    expect(screen.getByRole("button", { name: "Скейтборд" })).toBeOnTheScreen();
    expect(screen.getByText(stringsDash())).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Положить" }));
    await user.press(screen.getByRole("button", { name: "Сумма, больше" }));
    await user.press(screen.getByRole("button", { name: "Положить" }));

    expect(screen.getByText("Баланс -1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByText(stringsDash())).not.toBeOnTheScreen();
    expect(screen.getByText(/примерно 89/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByText("Копилка 1")).toBeOnTheScreen();
    expect(screen.getByText("1 / 90")).toBeOnTheScreen();
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

  it("celebrates when a deposit reaches the Цель", async () => {
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
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByText("Настроение +10")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.getByText("Выбери новую цель")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Телескоп" }));
    expect(screen.getByRole("button", { name: "Телескоп" })).toBeSelected();
  });
});

function stringsDash() {
  return "—";
}
