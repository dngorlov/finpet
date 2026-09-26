import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { DEV_TOOLS, RUNTIME_LIBRARIES } from "../credits";
import { HomeScene, type HomePet } from "../screens/HomeScene";
import { homeStrings } from "../stringsHome";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

function homeScene(pet: Partial<HomePet> = {}) {
  return (
    <HomeScene
      pet={{
        species: "sp1",
        color: "c1",
        accessory: "a1",
        petName: "Пух",
        care: 50,
        mood: 50,
        ...pet,
      }}
      day={1}
      waiting={false}
      goalName=""
      accumulated={0}
      cost={0}
      onShop={() => {}}
      onResults={() => {}}
      dayTip={false}
      onDayTip={() => {}}
    />
  );
}

describe("Главная scene", () => {
  it("keeps Магазин and Итоги as floating buttons and lets the pet speak without a tap", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    expect(screen.getByText("День 1")).toBeOnTheScreen();
    expect(screen.queryByText(/Каждый день сытость -15/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подсказка про день" }));
    expect(screen.getByText("Каждый день сытость -15 и счастье -15. Покупка в Магазине это отменяет.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Закрыть подсказку", includeHiddenElements: true }));
    expect(screen.queryByText(/Каждый день сытость -15/)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подсказка про день" }));
    expect(screen.getByText("Каждый день сытость -15 и счастье -15. Покупка в Магазине это отменяет.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подсказка про день" }));
    expect(screen.queryByText(/Каждый день сытость -15/)).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Магазин" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Итоги" })).toBeOnTheScreen();
    expect(screen.getByText(homeStrings.petLinesIdle[0])).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Поговорить с питомцем Пух" }));
    expect(screen.getByText(homeStrings.petLinesIdle[1])).toBeOnTheScreen();
  });

  it("switches the line when the pet gets hungry or sad", async () => {
    const view = await render(homeScene());
    expect(screen.getByText(homeStrings.petLinesIdle[0])).toBeOnTheScreen();

    await view.rerender(homeScene({ care: 10, mood: 80 }));
    expect(screen.getByText(homeStrings.petLinesHungry[0])).toBeOnTheScreen();

    await view.rerender(homeScene({ care: 50, mood: 10 }));
    expect(screen.getByText(homeStrings.petLinesSad[0])).toBeOnTheScreen();

    await view.rerender(homeScene({ care: 80, mood: 80 }));
    expect(screen.getByText(homeStrings.petLinesHappy[0])).toBeOnTheScreen();
  });
});

describe("Карта заданий compact panel", () => {
  it("shows reward and «Начать» in the panel and the rest in «Подробнее»", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Что такое бюджет?, открыто" }));
    expect(screen.getByLabelText("Награда: до 30 монет")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Начать" })).toBeOnTheScreen();
    expect(screen.queryByText(/Район: ЦАО/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Подробнее: Что такое бюджет?" }));
    expect(screen.getByText(/Район: ЦАО/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByText(/Район: ЦАО/)).not.toBeOnTheScreen();
  });

  it("lists every mini-game from Мини-игры, still locked until its lesson is done", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    expect(screen.queryByRole("button", { name: "Играть: Скидка или ловушка" })).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Мини-игры" }));
    expect(screen.getByText("Каждая игра относится к уроку и открывается, когда этот урок пройден.")).toBeOnTheScreen();
    expect(screen.getAllByText("Урок: Покупки")).toHaveLength(3);
    for (const title of ["Скидка или ловушка", "Что дешевле?", "Охота за ценником"]) {
      expect(screen.getByRole("button", { name: `Играть: ${title}` })).toBeDisabled();
    }
  });

  it("lists mini-games as chips that stay disabled until their lesson is done", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Покупки, закрыто" }));
    for (const title of ["Скидка или ловушка", "Что дешевле?", "Охота за ценником"]) {
      expect(screen.getByRole("button", { name: `Играть: ${title}` })).toBeDisabled();
    }
  });

  it("opens Словарик from the floating button, shows a word in a drawer, and reads one урок at a time", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Словарик" }));
    expect(screen.getByRole("button", { name: "Слова" })).toBeSelected();

    const plan = content.terms.find((term) => term.term === "План")!;
    expect(screen.queryByLabelText(plan.definition)).not.toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "План" }));
    expect(screen.getByLabelText(plan.definition)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByLabelText(plan.definition)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Уроки" }));
    expect(screen.getByRole("button", { name: "Уроки" })).toBeSelected();
    for (const title of ["Что такое бюджет?", "Планирование бюджета", "Что такое сбережения"]) {
      expect(screen.getByRole("button", { name: title })).toBeOnTheScreen();
    }
    expect(screen.queryByRole("button", { name: "Меняем план" })).not.toBeOnTheScreen();
    expect(screen.queryByLabelText(/Бюджет — это план твоих денег/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Что такое бюджет?" }));
    expect(screen.getByLabelText(/Бюджет — это план твоих денег/)).toBeOnTheScreen();
    expect(screen.getByLabelText(/Пух получает монеты/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByLabelText(/Бюджет — это план твоих денег/)).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Планирование бюджета" })).toBeOnTheScreen();
  });
});

describe("Об авторах и источниках", () => {
  it("lists every package.json dependency", () => {
    const pkg = require("../../../package.json") as {
      dependencies: Record<string, string>;
      devDependencies: Record<string, string>;
    };
    const listed = new Set([...RUNTIME_LIBRARIES, ...DEV_TOOLS].map((item) => item.pkg));
    for (const name of [...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]) {
      expect(listed).toContain(name);
    }
  });

  it("shows the credits on Настройки under the version line", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Настройки" }));
    expect(screen.getByRole("heading", { name: "Об авторах и источниках" })).toBeOnTheScreen();
    expect(screen.getByText("Drizzle ORM")).toBeOnTheScreen();
    expect(screen.getByText("Команда hsespbteam")).toBeOnTheScreen();
    expect(screen.getByText("Сергей Гончаров")).toBeOnTheScreen();
    expect(screen.getByText("Claude (Anthropic)")).toBeOnTheScreen();
    expect(screen.getByText("Press Start 2P")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Взрослый раздел" })).toBeOnTheScreen();
  });
});
