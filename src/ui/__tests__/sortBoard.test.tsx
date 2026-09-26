import { fireEvent, render, screen, userEvent } from "@testing-library/react-native";
import type { SortItem } from "../../core/tasks";
import { SortBoard } from "../games/SortBoard";
import type { DropFrame } from "../games/sortGeometry";

const mockFrames: DropFrame[] = [];

jest.mock("../games/sortGeometry", () => {
  const actual = jest.requireActual<typeof import("../games/sortGeometry")>("../games/sortGeometry");
  return {
    ...actual,
    readWindowFrame: (_node: unknown, save: (frame: DropFrame) => void) => {
      const frame = mockFrames.shift();
      if (frame) save(frame);
    },
  };
});

const NEED: DropFrame = { x: 0, y: 220, width: 160, height: 180 };
const WANT: DropFrame = { x: 180, y: 220, width: 160, height: 180 };

const ITEMS: SortItem[] = [
  { label: "Обед", icon: "🍱", bin: 0, explanation: "Еда каждый день.", hint: "Еду нельзя отложить." },
  { label: "Мячик", icon: "🎾", bin: 1, explanation: "Мячик подождёт.", hint: "Это желание." },
];

function touch(pageX: number, pageY: number) {
  return { nativeEvent: { pageX, pageY, locationX: 0, locationY: 0 } };
}

function stageBaskets() {
  mockFrames.push({ ...NEED }, { ...WANT });
}

async function renderBoard() {
  const onAnswer = jest.fn();
  const onDone = jest.fn();
  await render(
    <SortBoard bins={["Нужно", "Хочется"]} items={ITEMS} withPet={(text) => text} onAnswer={onAnswer} onDone={onDone} />,
  );
  return { onAnswer, onDone };
}

/** userEvent has no drag. pressIn → pressMove → pressOut is the gesture. */
async function drag(name: string, pageX: number, pageY: number) {
  const chip = screen.getByRole("button", { name });
  await fireEvent(chip, "pressIn", touch(12, 16));
  await fireEvent(chip, "pressMove", touch(pageX, pageY));
  await fireEvent(chip, "pressOut", touch(pageX, pageY));
}

describe("Нужно или хочется", () => {
  beforeEach(() => {
    mockFrames.length = 0;
  });

  it("кладёт фишку в корзину перетаскиванием", async () => {
    const { onAnswer } = await renderBoard();
    stageBaskets();

    await drag("Обед", 40, 300);

    expect(onAnswer).toHaveBeenCalledWith(0, "good");
    expect(screen.queryByRole("button", { name: "Обед" })).not.toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "Корзина «Нужно», в ней 1" })).toBeOnTheScreen();
    expect(screen.getByRole("status", { name: "Верно!" })).toBeOnTheScreen();
    expect(screen.getByText("Еда каждый день.")).toBeOnTheScreen();
    expect(screen.getByText("Серия: 1")).toBeOnTheScreen();
    expect(screen.getByText("Сытость на этом шаге поднимается.")).toBeOnTheScreen();
  });

  it("возвращает фишку из неверной корзины", async () => {
    const { onAnswer } = await renderBoard();
    stageBaskets();

    await drag("Обед", 220, 300);

    expect(onAnswer).toHaveBeenCalledWith(0, "bad");
    expect(screen.getByRole("button", { name: "Обед" })).toBeOnTheScreen();
    expect(screen.getByRole("status", { name: "Подумай ещё" })).toBeOnTheScreen();
    expect(screen.getByText("Еду нельзя отложить.")).toBeOnTheScreen();
    expect(screen.getByText("Фишка вернулась. Положи её в другую корзину.")).toBeOnTheScreen();
  });

  it("после промаха фишку можно положить нажатием", async () => {
    const user = userEvent.setup();
    const { onAnswer } = await renderBoard();

    await drag("Мячик", 12, 80);
    expect(screen.getByRole("button", { name: "Мячик" })).toBeSelected();

    await user.press(screen.getByRole("button", { name: /^Корзина «Хочется»/ }));

    expect(onAnswer).toHaveBeenCalledWith(1, "good");
    expect(screen.queryByRole("button", { name: "Мячик" })).not.toBeOnTheScreen();
  });

  it("по-прежнему раскладывает нажатиями", async () => {
    const user = userEvent.setup();
    const { onAnswer } = await renderBoard();

    await user.press(screen.getByRole("button", { name: "Обед" }));
    expect(screen.getByRole("button", { name: "Обед" })).toBeSelected();
    await user.press(screen.getByRole("button", { name: /^Корзина «Нужно»/ }));

    expect(onAnswer).toHaveBeenCalledWith(0, "good");
    expect(screen.getByRole("status", { name: "Верно!" })).toBeOnTheScreen();
  });

  it("подсказывает перетащить, если корзина нажата без фишки", async () => {
    const user = userEvent.setup();
    await renderBoard();

    await user.press(screen.getByRole("button", { name: /^Корзина «Нужно»/ }));

    expect(screen.getByText("Перетащи покупку в корзину. Или выбери её и нажми на корзину.")).toBeOnTheScreen();
  });

  it("просит подтвердить, когда все фишки перетащены", async () => {
    const user = userEvent.setup();
    const { onDone } = await renderBoard();
    stageBaskets();
    await drag("Обед", 40, 300);
    stageBaskets();
    await drag("Мячик", 220, 300);

    expect(screen.getByText("Все покупки разложены!")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подтвердить" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
