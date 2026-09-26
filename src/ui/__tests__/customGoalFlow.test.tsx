import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { openMoney } from "../testSupport/flowHelpers";

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("Своя цель", () => {
  it("shows the Порог only after the price drops below the cheapest preset", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports, { unlockMoney: true });
    const { user } = await renderApp(ports);

    await openMoney(user, "Копилка");
    expect(screen.queryByText(/До следующего этапа/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Цель" }));
    await user.press(screen.getByRole("button", { name: "Без цели" }));
    await user.press(screen.getByRole("button", { name: "Цель" }));
    await user.press(screen.getByRole("button", { name: "Своя цель" }));

    expect(screen.queryByText(/До следующего этапа/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Цена, меньше" }));
    expect(screen.getByText("До следующего этапа: 0 из 60")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Цена, больше" }));
    expect(screen.queryByText(/До следующего этапа/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Цена, меньше" }));
    await user.press(screen.getByRole("button", { name: "Значок ⭐" }));
    await user.press(screen.getByRole("button", { name: "Выбрать значок 🎈" }));
    await user.type(screen.getByRole("textbox", { name: "Название цели" }), "Наклейки");
    await user.press(screen.getByRole("button", { name: "Сделать целью" }));

    expect(screen.getByText("🎈 Наклейки")).toBeOnTheScreen();
    expect(screen.getAllByText("Наклейки").length).toBeGreaterThan(0);
    expect(screen.getAllByText("До следующего этапа: 0 из 60").length).toBeGreaterThan(0);
  });
});
