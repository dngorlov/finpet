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
  it("keeps the question after one wrong answer and stays gated after two", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    const first = visibleGatePrompt();
    await user.type(screen.getByRole("textbox", { name: "Ответ" }), "0");
    await user.press(screen.getByRole("button", { name: "Войти" }));
    expect(visibleGatePrompt()).toBe(first);
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();

    await user.type(screen.getByRole("textbox", { name: "Ответ" }), "0");
    await user.press(screen.getByRole("button", { name: "Войти" }));
    expect(screen.getByText(/Сколько будет \d+ × \d+\?/)).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Войти" })).toBeDisabled();
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
    expect(screen.getByRole("button", { name: "Магазин" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
    expect(screen.getByText(/Сколько будет \d+ × \d+\?/)).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Демо-режим" })).not.toBeOnTheScreen();
  });
});
