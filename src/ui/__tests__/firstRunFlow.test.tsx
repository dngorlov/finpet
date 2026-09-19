import { fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { strings } from "../strings";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();
const tourById = Object.fromEntries(content.hints.map((hint) => [hint.id, hint.body]));
const hubDestinations = ["План", "Магазин", "Копилка", "Задания", "Прогресс", "Взрослый раздел"] as const;

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  const view = await render(<FinPetApp ports={ports} />);
  return { user, ports, view };
}

async function finishName(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "Дальше" }));
  await user.type(screen.getByRole("textbox", { name: "Меня зовут" }), "Пух");
  await user.press(screen.getByRole("button", { name: "Дальше" }));
}

async function reachTour(user: ReturnType<typeof userEvent.setup>) {
  await finishName(user);
  await user.press(screen.getByRole("button", { name: "Понятно" }));
  await user.press(screen.getByRole("button", { name: "Дальше" }));
}

function nameField() {
  return screen.getByRole("textbox", { name: "Меня зовут" });
}

function expectNameChip(value: string) {
  expect(screen.getByText("Меня зовут")).toBeOnTheScreen();
  expect(screen.getAllByRole("textbox")).toHaveLength(1);
  expect(nameField()).toHaveDisplayValue(value);
  if (value === "") {
    expect(screen.getByPlaceholderText("____")).toBeOnTheScreen();
  }
  expect(screen.queryByText("Имя")).not.toBeOnTheScreen();
  expect(screen.queryByLabelText(/Питомец .* говорит:/)).not.toBeOnTheScreen();
}

function expectSelectedAppearanceOption(name: string) {
  const option = screen.getByRole("button", { name });
  expect(option).toBeSelected();
  expect(option).toHaveAccessibleName(name);
  expect(option).not.toBeDisabled();
}

function expectTourTooltip(body: string) {
  expect(screen.getByLabelText(body)).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "Назад" })).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "Пропустить" })).toBeOnTheScreen();
}

function expectHubBeat(body: string) {
  expectTourTooltip(body);
  expect(screen.queryByRole("button", { name: "Дальше" })).not.toBeOnTheScreen();
}

function expectDestinationBeat(body: string) {
  expectTourTooltip(body);
  expect(screen.getByRole("button", { name: "Дальше" })).toBeOnTheScreen();
}

function expectTutorialAllowance() {
  expect(screen.getByText("Баланс +10")).toBeOnTheScreen();
  expect(screen.getByText("Начало игрового дня")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "Дальше" })).toBeOnTheScreen();
  expect(screen.queryByRole("button", { name: "Понятно" })).not.toBeOnTheScreen();
  expect(screen.queryByText("Потому что начался новый игровой день.")).not.toBeOnTheScreen();
  expect(screen.queryByText("Что дальше: составь план дня.")).not.toBeOnTheScreen();
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

  it("starts Первый запуск when the runtime has no Intl.Segmenter", () => {
    const descriptor = Object.getOwnPropertyDescriptor(Intl, "Segmenter");
    Object.defineProperty(Intl, "Segmenter", { configurable: true, value: undefined });
    try {
      expect(() => {
        jest.isolateModules(() => {
          require("../FinPetApp");
        });
      }).not.toThrow();
    } finally {
      if (descriptor) {
        Object.defineProperty(Intl, "Segmenter", descriptor);
      } else {
        delete (Intl as { Segmenter?: typeof Intl.Segmenter }).Segmenter;
      }
    }
  });

  it("starts with pet customization before Имя and Как играть", async () => {
    const { user } = await renderApp();

    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.getByText(strings.speciesLegend)).toBeOnTheScreen();
    expect(screen.getByText(strings.colorLegend)).toBeOnTheScreen();
    expect(screen.getByText(strings.accessoryLegend)).toBeOnTheScreen();
    expect(screen.getByRole("img", { name: /Питомец.*Вид 1.*Окрас 1.*Аксессуар 1/ })).toBeOnTheScreen();
    expect(screen.queryByText(tourById["main-plan"]!)).not.toBeOnTheScreen();
    expectSelectedAppearanceOption("Вид 1");
    expect(screen.getByRole("button", { name: "Вид 2" })).not.toBeSelected();
    expect(screen.getByRole("button", { name: "Вид 2" })).not.toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    expect(screen.getByRole("img", { name: /Питомец.*Вид 2.*Окрас 1.*Аксессуар 1/ })).toBeOnTheScreen();
    expectSelectedAppearanceOption("Вид 2");
    expect(screen.getByRole("button", { name: "Вид 1" })).not.toBeSelected();
    expect(screen.getByRole("button", { name: "Вид 1" })).not.toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Окрас 2" }));
    expect(screen.getByRole("img", { name: /Питомец.*Вид 2.*Окрас 2.*Аксессуар 1/ })).toBeOnTheScreen();
    expectSelectedAppearanceOption("Окрас 2");
    expect(screen.getByRole("button", { name: "Окрас 1" })).not.toBeSelected();
    expect(screen.getByRole("button", { name: "Окрас 1" })).not.toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Аксессуар 3" }));
    expect(screen.getByRole("img", { name: /Питомец.*Вид 2.*Окрас 2.*Аксессуар 3/ })).toBeOnTheScreen();
    expectSelectedAppearanceOption("Аксессуар 3");
    expect(screen.getByRole("button", { name: "Аксессуар 1" })).not.toBeSelected();
    expect(screen.getByRole("button", { name: "Аксессуар 1" })).not.toBeDisabled();

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expectNameChip("");
  });

  it("walks pet, Имя, starting budget, Пособие, and the hub tour", async () => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    expectSelectedAppearanceOption("Вид 2");
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    expectNameChip("");
    expect(screen.getByRole("img", { name: /Питомец, Вид 2/ })).toBeOnTheScreen();
    expect(screen.queryByText("А тебя как зовут?")).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();
    expect(complete).not.toHaveBeenCalled();

    await user.type(nameField(), "Пух");
    expectNameChip("Пух");
    expect(screen.getByRole("img", { name: /Питомец, Вид 2/ })).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeEnabled();
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(complete).toHaveBeenCalledTimes(1);

    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(screen.getByText(/Планируй, копи, заботься/)).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Понятно" }));

    expectTutorialAllowance();
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    expectHubBeat(tourById["main-plan"]!);
    expect(screen.queryByLabelText(/Питомец .* говорит:/)).not.toBeOnTheScreen();
    expect(screen.getByText("Пособие +10 монет")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "План" }));
    expectDestinationBeat(tourById["plan-buckets"]!);
    expect(screen.getByText("План")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expectHubBeat(tourById["main-shop"]!);

    await user.press(screen.getByRole("button", { name: "Магазин" }));
    expectDestinationBeat(tourById["shop-lunch"]!);
    expect(screen.getByRole("button", { name: "Обед" })).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Обед" }));
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.getByText("Купить Обед за 12?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Купить" }));
    expect(screen.queryByText("Баланс -12")).not.toBeOnTheScreen();
    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!).balance).toBe(110);
    expect(ports.game.dayState(profileId!).plan.status).not.toBe("confirmed");

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expectHubBeat(tourById["main-savings"]!);
    await user.press(screen.getByRole("button", { name: "Копилка" }));
    expectDestinationBeat(tourById["savings-deposit"]!);
    expect(screen.getByRole("button", { name: "Положить" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expectDestinationBeat(tourById["main-task"]!);
    await user.press(screen.getByRole("button", { name: "Играть" }));
    expect(screen.queryByText("С чего начнёшь?")).not.toBeOnTheScreen();
    expectDestinationBeat(tourById["main-task"]!);

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.queryByText(tourById["main-task"]!)).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Пропустить" })).not.toBeOnTheScreen();

    expect(screen.getByText("Новичок")).toBeOnTheScreen();
    expect(screen.getByText("Забота 50")).toBeOnTheScreen();
    expect(screen.getByText("Настроение 50")).toBeOnTheScreen();
    expectMainChrome();
    expect(screen.getByText("Скейтборд")).toBeOnTheScreen();
    expect(screen.getByText("0 / 90")).toBeOnTheScreen();
    expect(screen.getByText("осталось 90")).toBeOnTheScreen();
    expect(screen.getByText("Первый план")).toBeOnTheScreen();
    expect(screen.getByText("Составь план дня")).toBeOnTheScreen();
    expect(screen.getByLabelText(/Питомец Пух.*Вид 2.*спокойный/)).toBeOnTheScreen();
    expect(ports.meta.get("howToPlayDone")).toBe("1");

    await user.press(screen.getByRole("button", { name: "Закончить день" }));
    expect(screen.getByText("Сначала составь план дня")).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Задания" }));
    expect(screen.getByText("Бюджет")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Играть" }));
    expect(screen.getByText("С чего начнёшь?")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Назад" }));

    await user.press(screen.getByRole("button", { name: "Прогресс" }));
    await user.press(screen.getByRole("button", { name: "Словарик" }));
    for (const term of content.terms) {
      expect(screen.getByText(term.term)).toBeOnTheScreen();
    }
    await user.press(screen.getByRole("button", { name: "Баланс" }));
    expect(screen.getByText(content.terms[0]!.definition)).toBeOnTheScreen();

    const activeProfileId = ports.meta.get("activeProfileId");
    expect(activeProfileId).not.toBeNull();
    const profileBeforeReplay = ports.game.getProfile(activeProfileId!);
    expect(profileBeforeReplay).toMatchObject({ name: "Пух", petName: "Пух" });
    await user.press(screen.getByRole("button", { name: "Как играть" }));
    expectHubBeat(tourById["main-plan"]!);
    expect(screen.queryByText("Потому что начался новый игровой день.")).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Закрыть" })).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Пропустить" }));
    expectMainChrome();
    expect(complete).toHaveBeenCalledTimes(1);
    expect(ports.meta.get("activeProfileId")).toBe(activeProfileId);
    expect(ports.game.getProfile(activeProfileId!)).toEqual(profileBeforeReplay);
  });

  it.each([
    ["hub План", async () => {}],
    [
      "План buckets",
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.press(screen.getByRole("button", { name: "План" }));
      },
    ],
    [
      "Магазин hub",
      async (user: ReturnType<typeof userEvent.setup>) => {
        await user.press(screen.getByRole("button", { name: "План" }));
        await user.press(screen.getByRole("button", { name: "Дальше" }));
      },
    ],
  ])("can skip Как играть from %s", async (_label, advance) => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);
    await reachTour(user);
    await advance(user);
    await user.press(screen.getByRole("button", { name: "Пропустить" }));

    expectMainChrome();
    expect(complete).toHaveBeenCalledTimes(1);
    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!)).toMatchObject({ name: "Пух", petName: "Пух", balance: 110 });
    expect(ports.meta.get("howToPlayDone")).toBe("1");
  });

  it("preserves the draft when moving back through Первый запуск", async () => {
    const ports = createFakePorts();
    const complete = jest.spyOn(ports.firstRun, "complete");
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.type(nameField(), "Пух");
    expectNameChip("Пух");
    await user.press(screen.getByRole("button", { name: "Назад" }));
    expectSelectedAppearanceOption("Вид 2");
    expect(complete).not.toHaveBeenCalled();
  });

  it("moves back through individual Как играть steps", async () => {
    const { user } = await renderApp();
    await reachTour(user);
    await user.press(screen.getByRole("button", { name: "План" }));
    expectDestinationBeat(tourById["plan-buckets"]!);

    await user.press(screen.getByRole("button", { name: "Назад" }));
    expectHubBeat(tourById["main-plan"]!);
  });

  it("still offers Как играть after a quit on Стартовый бюджет", async () => {
    const ports = createFakePorts();
    const { user, view } = await renderApp(ports);
    await finishName(user);
    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expectTutorialAllowance();
    await userEvent.setup().press(screen.getByRole("button", { name: "Дальше" }));
    expectHubBeat(tourById["main-plan"]!);
  });

  it("does not auto-start Как играть on a later launch after skip", async () => {
    const ports = createFakePorts();
    const { user, view } = await renderApp(ports);
    await reachTour(user);
    await user.press(screen.getByRole("button", { name: "Пропустить" }));
    expectMainChrome();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expect(screen.queryByText(tourById["main-plan"]!)).not.toBeOnTheScreen();
    expect(screen.queryByRole("button", { name: "Пропустить" })).not.toBeOnTheScreen();
    expectMainChrome();
  });

  it("validates the pet name after blur and restarts an abandoned draft", async () => {
    const ports = createFakePorts();
    const { user, view } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Вид 2" }));
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    const petName = nameField();
    await user.type(petName, "                     ");
    expectNameChip("");
    await fireEvent(petName, "blur");
    expect(screen.getByText("Введи от 1 до 20 символов")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();

    await view.unmount();
    await render(<FinPetApp ports={ports} />);
    expect(screen.getByText("Питомец")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Вид 1" })).toBeSelected();
  });

  it("counts visible graphemes and trims the pet name before saving", async () => {
    const ports = createFakePorts();
    const { user } = await renderApp(ports);
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    const petName = nameField();
    const family = "👨‍👩‍👧‍👦";

    await fireEvent.changeText(petName, family.repeat(21));
    expect(screen.getByRole("button", { name: "Дальше" })).toBeDisabled();

    await fireEvent.changeText(petName, ` ${family.repeat(20)} `);
    expect(screen.getByRole("button", { name: "Дальше" })).toBeEnabled();
    await user.press(screen.getByRole("button", { name: "Дальше" }));

    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!)).toMatchObject({
      name: family.repeat(20),
      petName: family.repeat(20),
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
    await user.press(screen.getByRole("button", { name: "Дальше" }));
    await user.type(nameField(), "Пух");

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Не получилось начать игру. Попробуй ещё раз.");
    expectNameChip("Пух");

    await user.press(screen.getByRole("button", { name: "Дальше" }));
    expect(screen.getByText("Тебе дали 100 монет на старт!")).toBeOnTheScreen();
    expect(complete).toHaveBeenCalledTimes(2);
    const profileId = ports.meta.get("activeProfileId");
    expect(profileId).not.toBeNull();
    expect(ports.game.getProfile(profileId!)).toMatchObject({ name: "Пух", petName: "Пух" });
  });

  it("skips Первый запуск for a returning child and opens Settings from the hub", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    expect(screen.queryByText(tourById["main-plan"]!)).not.toBeOnTheScreen();
    expectMainChrome();
    expect(screen.queryByText("Пособие +10 монет")).not.toBeOnTheScreen();
    expect(screen.queryByText("Потому что начался новый игровой день.")).not.toBeOnTheScreen();

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
