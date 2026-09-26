import { render, screen, userEvent } from "@testing-library/react-native";
import { ReplanBoard } from "../games/BudgetBoard";

describe("Пересобери план", () => {
  it("забирает сюрприз из банки, на которую нажали", async () => {
    const user = userEvent.setup();
    const onDone = jest.fn();
    await render(
      <ReplanBoard
        total={100}
        plan={{ mandatory: 40, wants: 30, savings: 30 }}
        event={{ bucket: "mandatory", delta: 10 }}
        outcomes={{ wants: "Ты перенёс необязательную покупку." }}
        withPet={(text) => text}
        onDone={onDone}
      />,
    );

    expect(screen.getByText("Нажми банку, из которой забрать монеты на сюрприз.")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Забрать 10 монет из «Желания»" }));
    expect(screen.getByText("Сумма совпала!")).toBeOnTheScreen();
    expect(screen.getByText("Крышки закрылись!")).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Подтвердить" }));
    expect(screen.getByLabelText(/Ты перенёс необязательную покупку/)).toBeOnTheScreen();
    await user.press(screen.getByRole("button", { name: "Готово" }));
    expect(onDone).toHaveBeenCalledTimes(1);
  });
});
