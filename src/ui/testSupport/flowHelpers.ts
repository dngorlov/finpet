import { screen, userEvent } from "@testing-library/react-native";

export const sixUnlocked = [
  "Первый план",
  "Сломался рюкзак",
  "Копилка мечты",
  "Большая распродажа",
  "Две цены",
  "Чек",
] as const;

export async function confirmTinyPlan(user: ReturnType<typeof userEvent.setup>) {
  await user.press(screen.getByRole("button", { name: "План" }));
  await user.press(screen.getByRole("button", { name: "Обязательные, больше" }));
  await user.press(screen.getByRole("button", { name: "Желаемые, больше" }));
  await user.press(screen.getByRole("button", { name: "Копилка, больше" }));
  await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
  await user.press(screen.getByRole("button", { name: "Подтвердить план" }));
  await user.press(screen.getByRole("button", { name: "Назад" }));
}
