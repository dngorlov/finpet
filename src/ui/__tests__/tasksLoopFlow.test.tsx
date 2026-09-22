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
    "unlocks Первый план, retries, pays +10 once, spawns Почини рюкзак, and opens the list from BlockedSheet",
    async () => {
      const ports = createFakePorts();
      const profileId = seedReturningChild(ports);
      const { user } = await renderApp(ports);

      await user.press(screen.getByRole("button", { name: "Задания" }));
      expect(screen.getByText("Бюджет")).toBeOnTheScreen();
      expect(screen.getByText("Копилки")).toBeOnTheScreen();
      expect(screen.getByText("Платежи")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Первый план" })).toBeOnTheScreen();
      expect(screen.queryByRole("button", { name: "Сломался рюкзак" })).not.toBeOnTheScreen();
      expect(screen.getAllByText("Откроется: завтра")).toHaveLength(5);
      expect(screen.queryByText("Почини рюкзак")).not.toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Первый план" }));
      await user.press(screen.getByRole("button", { name: "Сначала мороженое (7)" }));
      expect(screen.getByRole("status", { name: "⚠️ Попробуй ещё" })).toBeOnTheScreen();
      expect(screen.getByText("На обед больше не хватает. Желаемое подождёт, а питомец — нет.")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      expect(screen.getByText("С чего начнёшь?")).toBeOnTheScreen();
      expect(screen.queryByText("+10 монет")).not.toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Купить обед (10)" }));
      expect(screen.getByRole("status", { name: "✅ Верно" })).toBeOnTheScreen();
      expect(screen.getByText("Обязательные расходы — самое важное. Сначала нужды, потом мечты.")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      await user.press(screen.getByRole("button", { name: "5 монет" }));
      expect(screen.getByRole("status", { name: "✅ Верно" })).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дальше" }));

      expect(screen.getByText("+10 монет")).toBeOnTheScreen();
      expect(screen.getByText("Баланс +10")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Понятно" }));
      await user.press(screen.getByRole("button", { name: "В список заданий" }));

      expect(screen.getByText("Готово")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Первый план" }));
      await user.press(screen.getByRole("button", { name: "Купить обед (10)" }));
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      await user.press(screen.getByRole("button", { name: "5 монет" }));
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      expect(screen.queryByText("+10 монет")).not.toBeOnTheScreen();
      expect(screen.queryByText("Баланс +10")).not.toBeOnTheScreen();
      await backToMain(user);

      const day = ports.game.dayState(profileId);
      ports.game.purchase(profileId, day.dayId, cinema);
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
      await user.press(screen.getByRole("button", { name: "Выполнить задание" }));
      expect(screen.getByText("Бюджет")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));
      await user.press(screen.getByRole("button", { name: "Сделать целью" }));
      expect(screen.getByText(/Цель станет Игрушка/)).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Закрыть" }));
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await passAdultGate(user);
      await user.press(screen.getByRole("button", { name: "Демо-режим" }));
      await user.press(screen.getByRole("button", { name: "Готово" }));
      await user.press(screen.getByRole("button", { name: "Понятно" }));

      await user.press(screen.getByRole("button", { name: "Задания" }));
      await user.press(screen.getByRole("button", { name: "Сломался рюкзак" }));
      await user.press(screen.getByRole("button", { name: "Сначала яйцо" }));
      expect(screen.getByRole("status", { name: "⚠️ Попробуй ещё" })).toBeOnTheScreen();
      expect(screen.getByText("Новое задание появилось в списке!")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      expect(screen.queryByText("+10 монет")).not.toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "В список заданий" }));
      expect(screen.getByRole("button", { name: "Почини рюкзак" })).toBeOnTheScreen();
    },
    30000,
  );
});
