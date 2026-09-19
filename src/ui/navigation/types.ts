export type StubDestination = "plan" | "shop" | "savings" | "tasks";

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
  DaySummary: undefined;
  Demo: undefined;
  Stub: { destination: StubDestination };
};
