import { render, screen, userEvent } from "@testing-library/react-native";
import { loadContent } from "../../data/content";
import { FinPetApp } from "../FinPetApp";
import { DEV_TOOLS, RUNTIME_LIBRARIES } from "../credits";
import { homeStrings } from "../stringsHome";
import { createFakePorts, seedReturningChild } from "../testSupport/fakePorts";

const content = loadContent();

async function renderApp(ports = createFakePorts()) {
  const user = userEvent.setup();
  await render(<FinPetApp ports={ports} />);
  return { user, ports };
}

describe("Главная scene", () => {
  it("keeps Магазин and Итоги as floating buttons and lets the pet say a line", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    expect(screen.getByText("День 1")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Магазин" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Итоги" })).toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Поговорить с питомцем Пух" }));
    const lines = [
      ...homeStrings.petLinesHungry,
      ...homeStrings.petLinesSad,
      ...homeStrings.petLinesHappy,
      ...homeStrings.petLinesIdle,
    ];
    const escaped = lines.map((line) => line.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    expect(screen.getByText(new RegExp(`^(${escaped.join("|")})$`))).toBeOnTheScreen();
  });
});

describe("Карта заданий compact panel", () => {
  it("shows reward and «Начать» in the panel and the rest in «Подробнее»", async () => {
    const ports = createFakePorts();
    seedReturningChild(ports);
    const { user } = await renderApp(ports);

    await user.press(screen.getByRole("button", { name: "Карта" }));
    await user.press(screen.getByRole("button", { name: "Что такое бюджет?, открыто" }));
    expect(screen.getByLabelText("Награда: до 10 монет")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Начать" })).toBeOnTheScreen();
    expect(screen.queryByText(/Район: ЦАО/)).not.toBeOnTheScreen();

    await user.press(screen.getByRole("button", { name: "Подробнее: Что такое бюджет?" }));
    expect(screen.getByText(/Район: ЦАО/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Понятно" }));
    expect(screen.queryByText(/Район: ЦАО/)).not.toBeOnTheScreen();
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

  it("opens Словарик from the floating button, shows a word in a drawer, and styles Уроки as cards", async () => {
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
    expect(screen.getAllByText("Что такое бюджет?").length).toBeGreaterThan(0);
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
    expect(screen.getByText("Claude (Anthropic)")).toBeOnTheScreen();
    expect(screen.getByText("Press Start 2P")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Взрослый раздел" })).toBeOnTheScreen();
  });
});
