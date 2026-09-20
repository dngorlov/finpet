import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";
import { confirmTinyPlan } from "../testSupport/flowHelpers";

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
      await user.press(screen.getByRole("button", { name: "Закончить день" }));

      expect(screen.getByText("Итоги дня")).toBeOnTheScreen();
      expect(screen.getByLabelText("Этап Новичок")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Настройки" })).toBeOnTheScreen();
      expect(screen.getAllByText("план 1 · потрачено 0")).toHaveLength(3);
      expect(screen.getByText("Обязательные +0")).toBeOnTheScreen();
      expect(screen.getByText("По плану +1")).toBeOnTheScreen();
      expect(screen.getByText("Копилка +0")).toBeOnTheScreen();
      expect(screen.getByText("Забота -15: пропущены обязательные расходы")).toBeOnTheScreen();
      expect(screen.getByText("Настроение без изменений")).toBeOnTheScreen();
      expect(screen.getByText("Завтра сначала запланируй обязательное.")).toBeOnTheScreen();
      expect(screen.queryByText(/доверяет/)).not.toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Ждём завтра!" })).toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Ждём завтра!" }));

      expect(screen.getByText("Новый день откроется завтра")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "План" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Магазин" })).toBeDisabled();
      expect(screen.getByRole("button", { name: "Копилка" })).toBeDisabled();
      expect(screen.getByText("0")).toBeOnTheScreen();
      expect(screen.getAllByText("Откроется завтра").length).toBeGreaterThanOrEqual(3);
      expect(screen.queryByRole("button", { name: "Закончить день" })).not.toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Задания" }));
      expect(screen.getByText("Бюджет")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Первый план" }));
      await user.press(screen.getByRole("button", { name: "Купить обед (10)" }));
      expect(screen.getByRole("status", { name: "✅ Верно" })).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));
      expect(screen.getByText("Бюджет")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

      await user.press(screen.getByRole("button", { name: "Прогресс" }));
      expect(screen.getByRole("button", { name: "Журнал" })).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Назад" }));

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
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Закончить день" }));

    expect(screen.getByText("Итоги дня")).toBeOnTheScreen();
    expect(screen.getByText("план 45 · потрачено 45")).toBeOnTheScreen();
    expect(screen.getByText("план 0 · потрачено 0")).toBeOnTheScreen();
    expect(screen.getByText("план 15 · потрачено 15")).toBeOnTheScreen();
    expect(screen.getByText("Обязательные +2")).toBeOnTheScreen();
    expect(screen.getByText("По плану +1")).toBeOnTheScreen();
    expect(screen.getByText("Копилка +1")).toBeOnTheScreen();
    expect(screen.getByText("Забота без изменений")).toBeOnTheScreen();
    expect(screen.getByText("Настроение без изменений")).toBeOnTheScreen();
    expect(screen.getByText("Питомец доверяет тебе: теперь ты Друг!")).toBeOnTheScreen();
    expect(screen.getByLabelText("Этап Друг")).toBeOnTheScreen();
    expect(screen.getByText("Друг")).toBeOnTheScreen();
    expect(screen.queryByText("Завтра сначала запланируй обязательное.")).not.toBeOnTheScreen();
  });

  it("uses Следующий день on a demo profile so the next Игровой день can open", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports, { isDemo: true, name: "Демо", petName: "Демо" });
    const { user } = await renderApp(ports);

    await confirmTinyPlan(user);
    await user.press(screen.getByRole("button", { name: "Закончить день" }));

    expect(screen.queryByRole("button", { name: "Ждём завтра!" })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Следующий день" }));

    expect(screen.getByText("Пособие +10 монет")).toBeOnTheScreen();
    expect(screen.queryByText("Новый день откроется завтра")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Закончить день" })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "План" })).toBeEnabled();
  });
});
