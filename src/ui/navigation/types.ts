export type StubDestination = "plan" | "shop" | "savings" | "tasks" | "adult";

export type RootStackParamList = {
  FirstRun: undefined;
  HowToPlay: undefined;
  StartingBudget: undefined;
  Main: undefined;
  Plan: undefined;
  Shop: undefined;
  Savings: undefined;
  Progress: undefined;
  Settings: undefined;
  Stub: { destination: StubDestination };
};
