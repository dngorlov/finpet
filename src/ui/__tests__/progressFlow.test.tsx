import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const lunch = loadContent().catalog.find((item) => item.id === "lunch")!;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
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
    expect(screen.getByText("Пособие +10")).toBeOnTheScreen();
    expect(screen.getByText("Старт")).toBeOnTheScreen();
    expect(screen.getByText("Стартовый бюджет +100")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Итоги" }));
    expect(screen.getByText("Итоги появятся после первого закрытого игрового дня.")).toBeOnTheScreen();
  });
});
