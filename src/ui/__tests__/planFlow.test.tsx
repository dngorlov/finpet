import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
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

    await user.press(screen.getByRole("button", { name: "Деньги" }));
    expect(screen.getAllByText("Копилка").length).toBeGreaterThan(0);
    expect(screen.getByText("▼", { includeHiddenElements: true })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Раздел денег" }));
    expect(screen.getByText("▲", { includeHiddenElements: true })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Копилка" })).toBeSelected();
    const planTile = screen.getByRole("button", { name: "План" });
    expect(planTile).not.toBeSelected();
    expect(screen.queryByText("Составь план дня")).not.toBeOnTheScreen();

    await user.press(planTile);
    expect(screen.getByText("Сегодня пришло: +120")).toBeOnTheScreen();
    expect(screen.getByText("Можно распределить: 120")).toBeOnTheScreen();
    expect(screen.getByText("Это обещание на сегодня. Монеты пока в Балансе.")).toBeOnTheScreen();
    expect(screen.getByText("Счета на сегодня")).toBeOnTheScreen();
    expect(screen.getByText("Обед 12 · Проезд 8 = 20")).toBeOnTheScreen();
    expect(screen.getByText("Обязательных не меньше 20 — это счета.")).toBeOnTheScreen();
    expect(screen.getByText("Положишь их отдельно — в Копилке.")).toBeOnTheScreen();
    expect(screen.getByText("Останется свободных: 100")).toBeOnTheScreen();
    expect(screen.queryByText(/вчера \d+/)).not.toBeOnTheScreen();
    expect(screen.getByText("Обязательные 20")).toBeOnTheScreen();
    expect(screen.getByText("Желаемые 0")).toBeOnTheScreen();
    expect(screen.getByText("Копилка 0")).toBeOnTheScreen();
    expect(screen.getByText("Если ничего не отложить, Скейтборд не станет ближе.")).toBeOnTheScreen();
    expect(screen.getByText("Пока ни на что из желаемого не хватит.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Обязательные, меньше" })).toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    await user.press(screen.getByRole("button", { name: "Желаемые, больше" }));
    await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
    expect(screen.getByText("Обязательные 22")).toBeOnTheScreen();
    expect(screen.getByText("Останется свободных: 96")).toBeOnTheScreen();
    expect(screen.getByText("Скейтборд: накопишь через 90 дней, если откладывать столько каждый день.")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
    expect(screen.getByText("Подтвердить план дня?")).toBeOnTheScreen();
    expect(
      screen.getByText(
        "Это обещание. Монеты останутся в Балансе, пока ты не купишь в Магазине или не положишь в Копилку. Потом план не меняется.",
      ),
    ).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подтвердить план" }));

    expect(screen.getByText("план 22 · потрачено 0")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Обязательные, больше" })).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Подтвердить план" })).not.toBeOnTheScreen();
    expect(screen.queryByText("Это обещание на сегодня. Монеты пока в Балансе.")).not.toBeOnTheScreen();
    expect(screen.queryByText("Положишь их отдельно — в Копилке.")).not.toBeOnTheScreen();
    expect(screen.queryByText(/вчера \d+/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Раздел денег" }));
    expect(screen.getByRole("button", { name: "План" })).toBeSelected();
    expect(screen.queryByText("План готов")).not.toBeOnTheScreen();
    expect(screen.queryByText("Составь план дня")).not.toBeOnTheScreen();
    expect(screen.getByLabelText("Баланс 120")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Закончить день" })).not.toBeOnTheScreen();
  });

  it("blocks confirm when the План exceeds Баланс and keeps the draft editable", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 80, optional: 80, savings: 80 });
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Деньги" }));
    await user.press(screen.getByRole("button", { name: "Раздел денег" }));
    await user.press(screen.getByRole("button", { name: "План" }));
    expect(screen.getByText("Это обещание на сегодня. Монеты пока в Балансе.")).toBeOnTheScreen();
    expect(screen.getByText("Останется свободных: -120")).toBeOnTheScreen();
    expect(screen.getByText("В плане больше монет, чем есть. Убавь суммы.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeDisabled();
    expect(screen.queryByText(/вчера \d+/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Обязательные, меньше" }));
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeDisabled();
    expect(screen.getByText("Обязательные 79")).toBeOnTheScreen();
  });

  it("keeps Обязательные at today's Счета: a draft below them cannot be confirmed", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.saveDraftPlan(profileId, day.dayId, { mandatory: 5, optional: 0, savings: 0 });
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Деньги" }));
    await user.press(screen.getByRole("button", { name: "Раздел денег" }));
    await user.press(screen.getByRole("button", { name: "План" }));
    expect(screen.getByText("Обязательные 5")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
    expect(screen.getByText("Обязательные 20")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Подтвердить план" })).toBeEnabled();
  });
});
