import { fireEvent, render, screen, userEvent, within } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { strings } from "../strings";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();
const firstRule = strings.petSays("Пух", content.hints[0]!.body);
const hubDestinations = ["План", "Магазин", "Копилка", "Задания", "Прогресс", "Взрослый раздел"] as const;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  const view = await render(<FinPetApp ports={ports} />);
  return { user, ports, view };
}

async function reachHowToPlay(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "Дальше" }));
  await user.type(screen.getByRole("textbox", { name: "Как тебя зовут в игре?" }), "Миша");
  await user.type(screen.getByRole("textbox", { name: "Как зовут питомца?" }), "Пух");
  await user.press(screen.getByRole("button", { name: "Дальше" }));
}

function expectSelectedChip(name: string) {
  const chip = screen.getByRole("button", { name });
  expect(chip).toBeSelected();
  expect(chip).toHaveAccessibleName(name);
  expect(within(chip).queryByText(strings.selectedCheck)).not.toBeOnTheScreen();
  expect(
    within(chip).getByText(strings.selectedCheck, { includeHiddenElements: true }),
  ).toBeOnTheScreen();
}

function expectHowToPlayBubble() {
  expect(screen.getAllByLabelText(firstRule)).toHaveLength(1);
  expect(screen.queryByRole("img")).not.toBeOnTheScreen();
}

function expectMainChrome() {
  expect(screen.getByText("Этап Новичок")).toBeOnTheScreen();
  expect(screen.getByText("Баланс 110")).toBeOnTheScreen();
  expect(screen.getByText("Копилка 0")).toBeOnTheScreen();
  for (const name of hubDestinations) {
    expect(screen.getByRole("button", { name })).toBeOnTheScreen();
  }
  const planTile = screen.getByRole("button", { name: "План" });
  expect(planTile).toBeSelected();
  expect(planTile).toHaveAccessibleName("План");
  expect(screen.getByText("Составь план дня")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "Настройки" })).toBeOnTheScreen();
}

describe("first-run flow (Appendix A 1–4)", () => {
  it("starts Первый запуск when the runtime has no global crypto", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(globalThis, "crypto");
    Object.defineProperty(globalThis, "crypto", { configurable: true, value: undefined });
    try {
      await renderApp();
      expect(screen.getByText("Питомец")).toBeOnTheScreen();
    } finally {
      if (descriptor) {
        Object.defineProperty(globalThis, "crypto", descriptor);
      } else {
        delete (globalThis as { crypto?: Crypto }).crypto;
      }
    }
  });

  it("starts with pet customization before names and Как играть", async () => {
    const { user } = await renderApp();

    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.getByRole("img", { name: /Питомец.*Вид 1.*Окрас 1.*Аксессуар 1/ })).toBeOnTheScreen();
    expect(screen.queryByText(content.hints[0]!.body)).not.toBeOnTheScreen();
    expectSelectedChip("Вид 1");
    expect(screen.getByRole("button", { name: "Вид 2" })).not.toBeSelected();

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    expect(screen.getByRole("img", { name: /Питомец.*Вид 2.*Окрас 1.*Аксессуар 1/ })).toBeOnTheScreen();
    expectSelectedChip("Вид 2");
    expect(screen.getByRole("button", { name: "Вид 1" })).not.toBeSelected();

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Имена")).toBeOnTheScreen();
  });

  it("walks pet, names, pet-spoken rules, starting budget, and the hub", async () => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    expectSelectedChip("Вид 2");
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByText("Имена")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();
    expect(complete).not.toHaveBeenCalled();

    await user.type(screen.getByRole("textbox", { name: "Как тебя зовут в игре?" }), "Миша");
    await user.type(screen.getByRole("textbox", { name: "Как зовут питомца?" }), "Пух");
    expect(screen.getByRole("button", { name: "Дальше" })).toBeEnabled();
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByText("Как играть")).toBeOnTheScreen();
    expect(screen.getByText("Шаг 1 из 3")).toBeOnTheScreen();
    expect(screen.getByText("Пух")).toBeOnTheScreen();
    expectHowToPlayBubble();
    expect(screen.queryByRole("button", { name: "Карточка 1" })).not.toBeOnTheScreen();
    expect(complete).not.toHaveBeenCalled();

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Шаг 2 из 3")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Шаг 3 из 3")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Играть!" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Играть!" }));
    expect(complete).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(screen.getByText(/Планируй, копи, заботься/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Понятно" }));

    expect(screen.getByText("Новичок")).toBeOnTheScreen();
    expect(screen.getByText("Забота 50")).toBeOnTheScreen();
    expect(screen.getByText("Настроение 50")).toBeOnTheScreen();
    expectMainChrome();
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

    const activeProfileId = ports.meta.get("activeProfileId");
    expect(activeProfileId).not.toBeNull();
    const profileBeforeReplay = ports.game.getProfile(activeProfileId!);
    await user.press(screen.getByRole("button", { name: "Как играть" }));
    expect(screen.getByText("Шаг 1 из 3")).toBeOnTheScreen();
    expectHowToPlayBubble();
    expect(screen.getByRole("button", { name: "Закрыть" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Готово" }));
    expect(screen.getByText("Баланс")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Как играть" })).toBeOnTheScreen();
    expect(complete).toHaveBeenCalledTimes(1);
    expect(ports.meta.get("activeProfileId")).toBe(activeProfileId);
    expect(ports.game.getProfile(activeProfileId!)).toEqual(profileBeforeReplay);
  });

  it.each([1, 2, 3])("can skip Как играть from step %i", async (step) => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);
    await reachHowToPlay(user);

    for (let current = 1; current < step; current += 1) {
      await user.press(screen.getByRole("button", { name: "Дальше" }));
    }
    await user.press(screen.getByRole("button", { name: "Пропустить" }));

    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(complete).toHaveBeenCalledTimes(1);
  });

  it("preserves the draft when moving back through Первый запуск", async () => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    await reachHowToPlay(user);
    await user.press(screen.getByRole("button", { name: "Назад" }));

    expect(screen.getByRole("textbox", { name: "Как тебя зовут в игре?" })).toHaveDisplayValue("Миша");
    expect(screen.getByRole("textbox", { name: "Как зовут питомца?" })).toHaveDisplayValue("Пух");
    await user.press(screen.getByRole("button", { name: "Назад" }));
    expectSelectedChip("Вид 2");
    expect(complete).not.toHaveBeenCalled();
  });

  it("moves back through individual Как играть steps", async () => {
    const { user } = await renderApp();
    await reachHowToPlay(user);
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Шаг 2 из 3")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expect(screen.getByText("Шаг 1 из 3")).toBeOnTheScreen();
  });

  it("validates names after blur and restarts an abandoned draft", async () => {
    const ports = createFakePorts();
    const { user, view } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    const playerName = screen.getByRole("textbox", { name: "Как тебя зовут в игре?" });
    await user.type(playerName, "                     ");
    await fireEvent(playerName, "blur");
    expect(screen.getByText("Введи от 1 до 20 символов")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Вид 1" })).toBeSelected();
  });

  it("counts visible graphemes and trims names before saving", async () => {
    const ports = createFakePorts();
    const { user } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    const playerName = screen.getByRole("textbox", { name: "Как тебя зовут в игре?" });
    const petName = screen.getByRole("textbox", { name: "Как зовут питомца?" });
    const family = "👨‍👩‍👧‍👦";

    await fireEvent.changeText(playerName, family.repeat(21));
    await fireEvent.changeText(petName, "Пух");
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();

    await fireEvent.changeText(playerName, ` ${family.repeat(20)} `);
    await fireEvent.changeText(petName, " Пух ");
    expect(screen.getByRole("button", { name: "Дальше" })).toBeEnabled();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.press(screen.getByRole("button", { name: "Пропустить" }));

    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!)).toMatchObject({
      name: family.repeat(20),
      petName: "Пух",
    });
  });

  it("retains the draft and retries when profile creation fails", async () => {
    const ports = createFakePorts();
    const complete = jest
      .spyOn(ports.firstRun, "complete")
      .mockImplementationOnce(() => {
        throw new Error("write failed");
      });
    const { user } = await renderApp(ports);
    await reachHowToPlay(user);

    await user.press(screen.getByRole("button", { name: "Пропустить" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Не получилось начать игру. Попробуй ещё раз.");
    expect(screen.getByText("Шаг 1 из 3")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Пропустить" }));
    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(complete).toHaveBeenCalledTimes(2);
    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!).name).toBe("Миша");
  });

  it("skips Первый запуск for a returning child and opens Settings from the hub", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    expect(screen.queryByText(content.hints[0]!.title)).not.toBeOnTheScreen();
    expectMainChrome();
    expect(screen.queryByText("Пособие +10 монет")).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    expect(screen.getByText("ФинПет")).toBeOnTheScreen();
    expect(screen.getByText(/версия \d+\.\d+\.\d+ \(\d+\)/)).toBeOnTheScreen();
  });

  it("lets a developer Удалить профиль from Settings and start Первый запуск again", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user, view } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    expect(screen.getByText("Dev")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Удалить профиль" }));

    expect(screen.getByText("Питомец")).toBeOnTheScreen();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expect(screen.getByText("Питомец")).toBeOnTheScreen();
  });

  it("hides DevSettings on Settings when not __DEV__", async () => {
    const held = __DEV__;
    Object.defineProperty(globalThis, "__DEV__", { configurable: true, value: false });
    try {
      const ports = createFakePorts();
      seedReturningChild(ports);
      const { user } = await renderApp(ports);
      await user.press(screen.getByRole("button", { name: "Настройки" }));
      expect(screen.queryByText("Dev")).not.toBeOnTheScreen();
      expect(screen.queryByRole("button", { name: "Удалить профиль" })).not.toBeOnTheScreen();
    } finally {
      Object.defineProperty(globalThis, "__DEV__", { configurable: true, value: held });
    }
  });
});
