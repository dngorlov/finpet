import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { confirmTinyPlan, openMoney } from "../testSupport/flowHelpers";
import { META_KEYS } from "../../data/metaKeys";

const content = loadContent();

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("Итоги дня", () => {
  it(
    "closes a confirmed day, shows skipped-mandatory Итоги дня, then waits on Main",
    async () => {
      const ports = createFakePorts();
      seedReturningChild(ports);
      const { user } = await renderApp(ports);

      await confirmTinyPlan(user);
      const profileId = ports.meta.get(META_KEYS.activeProfileId)!;
      await user.press(screen.getByRole("button", { name: "Настройки" }));
      ports.game.closeDay(profileId, content.catalog, content.bills);
      await user.press(screen.getByRole("button", { name: "Назад" }));

      expect(screen.getByText("Новый день откроется завтра")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Магазин" })).toBeDisabled();
      expect(screen.queryByRole("button", { name: "Закончить день" })).not.toBeOnTheScreen();

      await openMoney(user, "План");
      expect(screen.getByText("Откроется завтра")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дом" }));

      await user.press(screen.getByRole("button", { name: "Итоги" }));
      expect(screen.getByText("план 21 · потрачено 0")).toBeOnTheScreen();
      expect(screen.getAllByText("план 1 · потрачено 0")).toHaveLength(2);
      expect(screen.getByText("Обязательные 0")).toBeOnTheScreen();
      expect(screen.getByText("По плану 0")).toBeOnTheScreen();
      expect(screen.getByText("Копилка 0")).toBeOnTheScreen();
      expect(screen.getByText("Забота -15: пропущены обязательные расходы")).toBeOnTheScreen();
      expect(screen.queryByText(/доверяет/)).not.toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Начать" }));
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      await user.press(screen.getByRole("button", { name: "Дальше" }));
      await user.press(screen.getByRole("button", { name: "Начать игру" }));
      await user.press(screen.getByRole("button", { name: "Нужно" }));
      expect(screen.getByRole("status", { name: "✅ Верно" })).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();

      await openMoney(user, "Журнал");
      expect(screen.getByText("Пособие +20")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дом" }));
      expect(screen.getByText("Новый день откроется завтра")).toBeOnTheScreen();
    },
    15000,
  );

  it("shows Этап copy and +2/+1/+1 after a scored close", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 45, optional: 0, savings: 15 });
    ports.game.confirmPlan(profileId, day.dayId);
    for (const item of content.catalog.filter((row) => row.kind === "mandatory")) {
      ports.game.purchase(profileId, day.dayId, item);
    }
    ports.game.transferToSavings(profileId, day.dayId, 15);
    ports.game.closeDay(profileId, content.catalog, content.bills);
    const { user } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Итоги" }));

    expect(screen.getByText("план 45 · потрачено 45")).toBeOnTheScreen();
    expect(screen.getByText("план 0 · потрачено 0")).toBeOnTheScreen();
    expect(screen.getByText("план 15 · потрачено 15")).toBeOnTheScreen();
    expect(screen.getByText("Обязательные +2")).toBeOnTheScreen();
    expect(screen.getByText("По плану +1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    expect(screen.getByText("Забота и настроение без изменений")).toBeOnTheScreen();
    expect(screen.getByText("Питомец доверяет тебе: теперь ты Друг!")).toBeOnTheScreen();
    expect(screen.getByLabelText("Этап Друг")).toBeOnTheScreen();
  });

  it("uses Следующий день on a demo profile so the next Игровой день can open", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports, { isDemo: true, name: "Демо", petName: "Демо" });
    const { user } = await renderApp(ports);

    await confirmTinyPlan(user);
    const profileId = ports.meta.get(META_KEYS.activeProfileId)!;
    await user.press(screen.getByRole("button", { name: "Настройки" }));
    ports.game.closeDay(profileId, content.catalog, content.bills);
    await user.press(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByText("Пособие +20 монет")).toBeOnTheScreen();
    expect(screen.queryByText("Новый день откроется завтра")).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Закончить день" })).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Магазин" })).toBeEnabled();
  });
});
