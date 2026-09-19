export type StubDestination = "plan" | "shop" | "savings" | "adult";

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
  TaskList: undefined;
  TaskRun: { taskId: string };
  TaskResult: { taskId: string; reward: number; sceneCoins: number };
  Stub: { destination: StubDestination };
};
