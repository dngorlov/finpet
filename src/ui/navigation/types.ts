export type StubDestination = "plan" | "shop" | "savings";

export type RootStackParamList = {
  FirstRun: undefined;
  Main: undefined;
  Plan: undefined;
  Shop: undefined;
  Savings: undefined;
  Progress: undefined;
  Settings: undefined;
  DaySummary: undefined;
  AdultGate: undefined;
  Demo: undefined;
  TaskList: undefined;
  TaskRun: { taskId: string };
  TaskResult: { taskId: string; reward: number; sceneCoins: number };
  Stub: { destination: StubDestination };
};
