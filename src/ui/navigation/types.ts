export type StubDestination = "plan" | "shop" | "savings" | "tasks" | "adult";

export type RootStackParamList = {
  FirstRun: undefined;
  HowToPlay: undefined;
  StartingBudget: undefined;
  Main: undefined;
  Plan: undefined;
  Glossary: undefined;
  Settings: undefined;
  Stub: { destination: StubDestination };
};
