import { render, screen, userEvent } from "@testing-library/react-native";
import type { CatalogItem } from "../../core/economy";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { passAdultGate } from "../testSupport/flowHelpers";

const lunch: CatalogItem = {
  id: "lunch",
  kind: "mandatory",
  price: 12,
  effect: { meter: "care", delta: 10 },
};

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  const view = await render(<FinPetApp ports={ports} />);
  return { user, ports, view };
}

function playSomeEconomy(ports: ReturnType<typeof createFakePorts>, profileId: string) {
  const day = ports.game.dayState(profileId);
  ports.game.purchase(profileId, day.dayId, lunch);
  ports.game.transferToSavings(profileId, day.dayId, 15);
  ports.game.claimTaskReward(profileId, day.dayId, "budget_what", 10);
}

describe("Взрослый раздел contents and persistence", () => {
  it("shows positive progress and typed сбросить restores identity on Main", async () => {
    const ports = createFakePorts();
    const childId = seedReturningChild(ports);
    playSomeEconomy(ports, childId);
    const { user } = await renderApp(ports);

    expect(screen.getByLabelText("Баланс 103")).toBeOnTheScreen();
    await passAdultGate(user);
    expect(screen.getByText("Бюджет: сделано 1 из 2")).toBeOnTheScreen();
    expect(screen.getByText("Копилки: ещё впереди")).toBeOnTheScreen();
    expect(screen.getByText("Платежи: ещё впереди")).toBeOnTheScreen();
    expect(screen.getByText("Игровых дней пока нет — это нормально.")).toBeOnTheScreen();
    expect(screen.getByText("Задания 1/9")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Сбросить прогресс" }));
    expect(screen.getByText("Прогресс сбросится, имена и вид питомца останутся.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByRole("button", { name: "Готово" })).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Введи: сбросить" }), "сбросить");
    await user.press(screen.getByRole("button", { name: "Готово" }));
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    expect(screen.getByLabelText("Баланс 120")).toBeOnTheScreen();
    expect(screen.getByLabelText(/Питомец Пух/)).toBeOnTheScreen();
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("0 / 90")).toBeOnTheScreen();
    expect(ports.game.listTaskProgress(ports.meta.get("activeProfileId")!)).toEqual([]);
  });

  it("remounts onto Main with the same Баланс, Копилка, Цель, and task progress", async () => {
    const ports = createFakePorts();
    const childId = seedReturningChild(ports);
    playSomeEconomy(ports, childId);
    const { view } = await renderApp(ports);

    expect(screen.getByLabelText("Баланс 103")).toBeOnTheScreen();
    expect(screen.getByText("15 / 90")).toBeOnTheScreen();
    expect(screen.getByLabelText("Забота 60")).toBeOnTheScreen();
    expect(ports.game.listTaskProgress(childId)).toEqual([
      { taskKey: "budget_what", status: "completed", rewardPaid: true, bestReward: 10 },
    ]);

    await view.unmount();
    await render(<FinPetApp ports={ports} />);

    expect(screen.getByLabelText("Баланс 103")).toBeOnTheScreen();
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("15 / 90")).toBeOnTheScreen();
    expect(screen.getByLabelText("Забота 60")).toBeOnTheScreen();
    expect(screen.getByLabelText(/Питомец Пух/)).toBeOnTheScreen();
    expect(ports.game.listTaskProgress(childId)).toEqual([
      { taskKey: "budget_what", status: "completed", rewardPaid: true, bestReward: 10 },
    ]);
  });

  it("typed удалить returns to Первый запуск and stays there after remount", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user, view } = await renderApp(ports);

    await passAdultGate(user);
    await user.press(screen.getByRole("button", { name: "Удалить профиль" }));
    expect(screen.getByText("Питомец и все игровые дни пропадут с устройства.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByRole("button", { name: "Готово" })).toBeDisabled();
    await user.type(screen.getByRole("textbox", { name: "Введи: удалить" }), "удалить");
    await user.press(screen.getByRole("button", { name: "Готово" }));

    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Магазин" })).not.toBeOnTheScreen();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Магазин" })).not.toBeOnTheScreen();
  });

  it("hides child reset and delete while Демо-режим is active", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await passAdultGate(user);
    await user.press(screen.getByRole("button", { name: "Демо-режим" }));
    await user.press(screen.getByRole("button", { name: "Готово" }));
    await user.press(screen.getByRole("button", { name: "Понятно" }));

    await passAdultGate(user);
    expect(screen.getByRole("button", { name: "Сбросить демо" })).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Сбросить прогресс" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Удалить профиль" })).not.toBeOnTheScreen();
  });
});
