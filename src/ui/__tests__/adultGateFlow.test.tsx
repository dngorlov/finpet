import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { passAdultGate, visibleGatePrompt } from "../testSupport/flowHelpers";

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("AdultGate", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("keeps the question after one wrong answer and replaces it after two", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    let secondQuestion = false;
    jest.spyOn(Math, "random").mockImplementation(() => (secondQuestion ? 0.9 : 0));

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    expect(visibleGatePrompt()).toBe("Сколько будет 10 × 2?");
    await user.type(screen.getByRole("textbox", { name: "Ответ" }), "0");
    await user.press(screen.getByRole("button", { name: "Войти" }));
    expect(visibleGatePrompt()).toBe("Сколько будет 10 × 2?");
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();

    secondQuestion = true;
    await user.type(screen.getByRole("textbox", { name: "Ответ" }), "0");
    await user.press(screen.getByRole("button", { name: "Войти" }));
    expect(visibleGatePrompt()).toBe("Сколько будет 91 × 9?");
    expect(screen.getByRole("button", { name: "Войти" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();
  });

  it("does not unlock after Back from the gate", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    expect(screen.getByText(/Сколько будет \d+ × \d+\?/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("button", { name: "Взрослый раздел" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    expect(screen.getByText(/Сколько будет \d+ × \d+\?/)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();
  });

  it("opens the demo panel on a correct product and gates the next visit", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await passAdultGate(user);
    expect(screen.getByText("Взрослый раздел")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Демо-режим" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByRole("button", { name: "Взрослый раздел" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    expect(screen.getByText(/Сколько будет \d+ × \d+\?/)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();
  });
});
