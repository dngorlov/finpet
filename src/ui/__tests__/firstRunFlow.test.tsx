import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("first-run flow (Appendix A 1–4)", () => {
  it("walks intro, profile, starting budget, and the hub, then opens Словарик", async () => {
    const { user } = await renderApp();

    expect(screen.getByText(content.hints[0]!.title)).toBeOnTheScreen();
    expect(screen.getByText(content.hints[0]!.body)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Карточка 2" }));
    expect(screen.getByText(content.hints[1]!.title)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Карточка 3" }));
    expect(screen.getByText(content.hints[2]!.title)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Пропустить" }));

    expect(screen.getByText("Как тебя зовут в игре?")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Играть!" })).toBeDisabled();

    await user.type(screen.getByRole("textbox", { name: "Как тебя зовут в игре?" }), "Миша");
    await user.type(screen.getByRole("textbox", { name: "Как зовут питомца?" }), "Пух");
    await user.press(screen.getByRole("button", { name: "Вид 2" }));

    expect(screen.getByLabelText(/Питомец.*Вид 2.*Окрас 1.*Аксессуар 1/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Играть!" }));

    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(screen.getByText(/Планируй, копи, заботься/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Понятно" }));

    expect(screen.getByText("Новичок")).toBeOnTheScreen();
    expect(screen.getByText("Забота 50")).toBeOnTheScreen();
    expect(screen.getByText("Настроение 50")).toBeOnTheScreen();
    expect(screen.getByText("Баланс 110")).toBeOnTheScreen();
    expect(screen.getByText("Копилка 0")).toBeOnTheScreen();
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("0 / 90")).toBeOnTheScreen();
    expect(screen.getByText("осталось 90")).toBeOnTheScreen();
    expect(screen.getByText("Первый план")).toBeOnTheScreen();
    expect(screen.getByText("Составь план дня")).toBeOnTheScreen();
    expect(screen.getByText("Пособие +10 монет")).toBeOnTheScreen();
    expect(screen.getByLabelText(/Питомец Пух.*Вид 2.*спокойный/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Закончить день" }));
    expect(screen.getByText("Сначала составь план дня")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Задания" }));
    expect(screen.getByText(/скоро/i)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Играть" }));
    expect(screen.getByText(/скоро/i)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Прогресс" }));
    for (const term of content.terms) {
      expect(screen.getByText(term.term)).toBeOnTheScreen();
    }
    await user.press(screen.getByRole("button", { name: "Баланс" }));
    expect(screen.getByText(content.terms[0]!.definition)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Как играть" }));
    expect(screen.getByText(content.hints[0]!.title)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Пропустить" }));
    expect(screen.getByText("Баланс")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Как играть" })).toBeOnTheScreen();
  });

  it("skips intro for a returning child and opens Settings from the hub", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    expect(screen.queryByText(content.hints[0]!.title)).not.toBeOnTheScreen();
    expect(screen.getByText("Баланс 110")).toBeOnTheScreen();
    expect(screen.getByText("Новичок")).toBeOnTheScreen();
    expect(screen.queryByText("Пособие +10 монет")).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    expect(screen.getByText("ФинПет")).toBeOnTheScreen();
    expect(screen.getByText(/версия \d+\.\d+\.\d+ \(\d+\)/)).toBeOnTheScreen();
  });
});
