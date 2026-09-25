import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { passAdultGate } from "../testSupport/flowHelpers";

const content = loadContent();
const cinema = content.catalog.find((item) => item.id === "cinema")!;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

async function backToMain(user: ReturnType<typeof userEvent.setup>) {
  const home = screen.queryByRole("button", { name: "Дом" });
  if (home) await user.press(home);
  if (screen.queryByRole("button", { name: "Магазин" })) return;
  for (let i = 0; i < 8; i += 1) {
    if (screen.queryByRole("button", { name: "Магазин" })) return;
    const back = screen.queryByRole("button", { name: "Назад" });
    if (!back) throw new Error("Не удалось вернуться на главный экран");
    await user.press(back);
  }
  throw new Error("Не удалось вернуться на главный экран");
}

describe("Задания combined loop", () => {
  it(
    "reaches the map from the hub and from BlockedSheet, and Демо-режим opens every mission",
    async () => {
      const ports = createFakePorts();
      const profileId = seedReturningChild(ports);
      const { user } = await renderApp(ports);

      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Что такое бюджет?")).toBeOnTheScreen();
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
      expect(screen.getAllByRole("button", { name: /, закрыто$/ })).toHaveLength(5);
      expect(screen.getAllByRole("button", { name: /, скоро$/ })).toHaveLength(3);
      expect(screen.queryByText("Почини рюкзак")).not.toBeOnTheScreen();
      await backToMain(user);

      const day = ports.game.dayState(profileId);
      for (let i = 0; i < 6; i += 1) ports.game.purchase(profileId, day.dayId, cinema);

      await user.press(screen.getByRole("button", { name: "Магазин" }));
      await user.press(screen.getByRole("button", { name: "Желаемое" }));
      await user.press(screen.getByRole("button", { name: /^Игрушка/ }));
      expect(screen.queryByRole("button", { name: "Купить" })).not.toBeOnTheScreen();
      expect(screen.getByText(/Не хватает/)).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Выполнить задание" }));
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дом" }));
      await user.press(screen.getByRole("button", { name: "Магазин" }));
      await user.press(screen.getByRole("button", { name: "Желаемое" }));
      await user.press(screen.getByRole("button", { name: /^Игрушка/ }));
      await user.press(screen.getByRole("button", { name: "Сделать целью" }));
      expect(screen.getByText(/Цель станет Игрушка/)).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Закрыть" }));
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await passAdultGate(user);
      await user.press(screen.getByRole("button", { name: "Демо-режим" }));
      await user.press(screen.getByRole("button", { name: "Готово" }));
      await user.press(screen.getByRole("button", { name: "Понятно" }));

      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.queryAllByRole("button", { name: /, закрыто$/ })).toHaveLength(0);
      expect(screen.getAllByRole("button", { name: /, открыто$/ })).toHaveLength(6);
      await user.press(screen.getByRole("button", { name: "Покупки, открыто" }));
      expect(screen.getByText("Мини-игры")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Играть: Скидка или ловушка" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Играть: Охота за ценником" })).toBeOnTheScreen();
    },
    30000,
  );
});
