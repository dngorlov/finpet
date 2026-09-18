import { render, screen } from "@testing-library/react-native";
import MainScreen from "../screens/MainScreen";

describe("MainScreen", () => {
  it("renders the app name in Russian", async () => {
    await render(<MainScreen />);

    expect(screen.getByText("ФинПет")).toBeOnTheScreen();
  });

  it("shows the version and build number in the footer", async () => {
    await render(<MainScreen />);

    expect(screen.getByText(/версия \d+\.\d+\.\d+ \(\d+\)/)).toBeOnTheScreen();
  });
});
