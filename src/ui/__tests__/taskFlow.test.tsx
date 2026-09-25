import { render, screen, userEvent } from "@testing-library/react-native";
import { FinPetApp } from "../FinPetApp";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

type User = ReturnType<typeof userEvent.setup>;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

/** «Нужно или хочется?» baskets in content order. */
const NEED_OR_WANT = ["Нужно", "Хочется", "Нужно", "Хочется", "Нужно", "Хочется", "Нужно", "Хочется"];

async function playBudgetWhat(user: User, { mistakes = 0 }: { mistakes?: number } = {}) {
  expect(screen.getByText("Что такое бюджет?")).toBeOnTheScreen();
  expect(screen.getByText(/Бюджет — это план твоих денег/)).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Дальше" }));
  expect(screen.getByText(/Пух получает монеты за задания/)).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Дальше" }));
  await user.press(screen.getByRole("button", { name: "Начать игру" }));
  for (const [index, bin] of NEED_OR_WANT.entries()) {
    if (index < mistakes) {
      const wrong = bin === "Нужно" ? "Хочется" : "Нужно";
      await user.press(screen.getByRole("button", { name: wrong }));
      expect(screen.getByRole("status", { name: "Попробуй ещё" })).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Дальше" }));
    }
    expect(screen.getByText(`${index + 1} из ${NEED_OR_WANT.length}`)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: bin }));
    expect(screen.getByRole("status", { name: "Верно" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
  }
  expect(screen.getByText("У питомца Пух всего 25 монет. Что купить в первую очередь?")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "Обед и тетради" }));
  await user.press(screen.getByRole("button", { name: "Дальше" }));
}

describe("Карта заданий", () => {
  it("shows the open Игровой день under the pet", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    await renderApp(ports);
    expect(screen.getByText("День 1")).toBeOnTheScreen();
  });

  it("opens Итоги дня when a day has ended and the next one has not begun", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    const lesson = ports.content.tasks.find((task) => task.id === "budget_what");
    if (!lesson) throw new Error("нет урока");
    ports.game.claimTaskReward(profileId, day.dayId, lesson.id, 10, {
      task: lesson,
      catalog: ports.content.catalog,
      bills: ports.content.bills,
    });

    const { user } = await renderApp(ports);
    expect(screen.getByText("Сытость -15: пропущен обед")).toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Магазин" })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Следующий день" }));
    expect(screen.getByText("День 2")).toBeOnTheScreen();
    expect(screen.getByText("Пособие +20 монет")).toBeOnTheScreen();
  });

  it(
    "opens only «Что такое бюджет?», pays by score, then opens the next lessons and pays only a better replay",
    async () => {
      const ports = createFakePorts();
      seedReturningChild(ports);
      const { user } = await renderApp(ports);

      await user.press(screen.getByRole("button", { name: "Карта" }));
      expect(screen.getByText("Карта заданий")).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Что такое бюджет?, открыто" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Планирование бюджета, открыто" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Что такое сбережения, открыто" })).toBeOnTheScreen();
      expect(screen.getByText("Награда: до 10 монет")).toBeOnTheScreen();
      expect(screen.getByLabelText("Сложность: 1 из 3")).toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Платежи, закрыто" }));
      expect(screen.getByText("Откроется после «Что такое бюджет?»")).toBeOnTheScreen();
      expect(screen.queryByRole("button", { name: "Начать" })).not.toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Что такое бюджет?, открыто" }));
      await user.press(screen.getByRole("button", { name: "Начать" }));
      await playBudgetWhat(user, { mistakes: 2 });

      // 7 of 9 right on the first try → round(10 × 7/9) = 8.
      expect(screen.getByText("Верно с первого раза: 7 из 9")).toBeOnTheScreen();
      expect(screen.getByText("+8 монет")).toBeOnTheScreen();
      expect(screen.getByText("За лучший ответ можно получить ещё 2")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Понятно" }));
      await user.press(screen.getByRole("button", { name: "Итоги дня" }));

      expect(screen.getByText("Сытость -15: пропущен обед")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Следующий день" }));
      expect(screen.getByText("День 2")).toBeOnTheScreen();
      expect(screen.getByText("Пособие +20 монет")).toBeOnTheScreen();
      await user.press(screen.getByRole("button", { name: "Понятно" }));
      await user.press(screen.getByRole("button", { name: "Карта" }));

      expect(screen.getByRole("button", { name: "Что такое бюджет?, пройдено" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Планирование бюджета, открыто" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Что такое сбережения, открыто" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Платежи, открыто" })).toBeOnTheScreen();
      expect(screen.getByRole("button", { name: "Где живут накопления?, закрыто" })).toBeOnTheScreen();
      expect(screen.getAllByRole("button", { name: "Новый урок, скоро" })).toHaveLength(3);
      await user.press(screen.getByRole("button", { name: "Что такое бюджет?, пройдено" }));
      expect(screen.getByText("Лучший результат: 8 из 10 монет")).toBeOnTheScreen();

      await user.press(screen.getByRole("button", { name: "Пройти ещё раз" }));
      await playBudgetWhat(user);
      expect(screen.getByText("Верно с первого раза: 9 из 9")).toBeOnTheScreen();
      expect(screen.getByText("+2 монеты")).toBeOnTheScreen();
      expect(screen.getByText("Ты собрал все монеты за это задание")).toBeOnTheScreen();
    },
    30000,
  );

  it("retries a wrong quiz answer and scores only the first try", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.claimTaskReward(profileId, day.dayId, "budget_what", 10);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Что такое сбережения, открыто" }));
    await user.press(screen.getByRole("button", { name: "Начать" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Проверить себя" }));

    expect(screen.getByText(/У питомца Пух есть 50 монет/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Потратить все 50 монет" }));
    expect(screen.getByRole("status", { name: "Попробуй ещё" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Отложить часть монет" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Накопится 50 монет" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Верно" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "30 монет" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    // 3 of 4 on the first try → round(10 × 3/4) = 8.
    expect(screen.getByText("Верно с первого раза: 3 из 4")).toBeOnTheScreen();
    expect(screen.getByText("+8 монет")).toBeOnTheScreen();
  });

  it("spawns Почини рюкзак from the plan-vs-fact safe error", async () => {
    const ports = createFakePorts();
    const profileId = seedReturningChild(ports);
    const day = ports.game.dayState(profileId);
    ports.game.claimTaskReward(profileId, day.dayId, "budget_what", 10);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Планирование бюджета, открыто" }));
    await user.press(screen.getByRole("button", { name: "Начать" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Начать игру" }));
    await user.press(screen.getByRole("button", { name: "Нужное 20 · Хочется 10 · Копилка 10" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Желаемые и копилка" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Лишние покупки съели монеты для копилки" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Всё равно купить мороженое" }));
    expect(screen.getByText("Новое задание появилось в списке!")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Сначала распределить монеты, потом идти в магазин" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Итоги дня" }));
    await user.press(screen.getByRole("button", { name: "Следующий день" }));
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    await user.press(screen.getByRole("button", { name: "Карта" }));

    expect(screen.getByText("Исправить ошибку")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Почини рюкзак" })).toBeOnTheScreen();
  });
});
