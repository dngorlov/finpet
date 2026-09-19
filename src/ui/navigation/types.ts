export type StubDestination = "plan" | "shop" | "savings" | "tasks" | "adult";

export type RootStackParamList = {
  Onboarding: { replay?: boolean } | undefined;
  ProfileSetup: undefined;
  StartingBudget: undefined;
  Main: undefined;
  Glossary: undefined;
  Settings: undefined;
  Stub: { destination: StubDestination };
};
