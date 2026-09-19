import { screen, userEvent } from "@testing-library/react-native";

export const sixUnlocked = [
  "Первый план",
  "Сломался рюкзак",
  "Копилка мечты",
  "Большая распродажа",
  "Две цены",
  "Чек",
] as const;

function collectText(node: unknown): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (typeof node !== "object") return "";
  const children = "props" in node ? (node as { props: { children?: unknown } }).props.children : undefined;
  if (Array.isArray(children)) return children.map(collectText).join("");
  return collectText(children);
}

export function visibleGatePrompt(): string {
  return collectText(screen.getByText(/Сколько будет \d+ × \d+\?/));
}

export function visibleGateProduct(): number {
  const match = visibleGatePrompt().match(/(\d+)\s*×\s*(\d+)/);
  if (!match) throw new Error(`Не разобрали вопрос: ${visibleGatePrompt()}`);
  return Number(match[1]) * Number(match[2]);
}

/** Open Взрослый раздел and type the visible product. */
export async function passAdultGate(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "Взрослый раздел" }));
  await user.type(screen.getByRole("textbox", { name: "Ответ" }), String(visibleGateProduct()));
  await user.press(screen.getByRole("button", { name: "Войти" }));
}

export async function confirmTinyPlan(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "План" }));
  await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
  await user.press(screen.getByRole("button", { name: "Желаемые, больше" }));
  await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
  await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
  await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
  await user.press(screen.getByRole("button", { name: "Назад" }));
}
