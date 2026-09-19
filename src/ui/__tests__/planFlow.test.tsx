import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
import { strings } from "../strings";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("plan from Main", () => {
  it("lets a returning child confirm a План, then locks it and marks the hub ready", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    const planTile = screen.getByRole("button", { name: "План" });
    expect(planTile).toBeSelected();
    expect(screen.getByText("Составь план дня")).toBeOnTheScreen();

    await user.press(planTile);
    expect(screen.getByText("Можно распределить: 110")).toBeOnTheScreen();
    expect(screen.getByText("Останется свободных: 110")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    await user.press(screen.getByRole("button", { name: "Желаемые, больше" }));
    await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
    expect(screen.getByText("Обязательные 2")).toBeOnTheScreen();
    expect(screen.getByText("Останется свободных: 106")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
    expect(screen.getByText("Подтвердить план дня?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));

    expect(screen.getByText("план 2 · потрачено 0")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Обязательные, больше" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Подтвердить план" })).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByText("План готов")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "План" })).not.toBeSelected();
    expect(screen.getByText("Баланс 110")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Закончить день" }));
    expect(screen.getByText(strings.finishDayLater)).toBeOnTheScreen();
  });

  it("blocks confirm when the План exceeds Баланс and keeps the draft editable", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 80, optional: 80, savings: 80 });
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "План" }));
    expect(screen.getByText("Останется свободных: -130")).toBeOnTheScreen();
    expect(screen.getByText("В плане больше монет, чем есть. Убавь суммы.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Обязательные, меньше" }));
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeDisabled();
    expect(screen.getByText("Обязательные 79")).toBeOnTheScreen();
  });
});
