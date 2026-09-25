export type StubDestination = "plan" | "shop" | "savings";

export type RootStackParamList = {
  FirstRun: undefined;
  Main: undefined;
  Shop: undefined;
  Results: undefined;
  Handbook: undefined;
  Settings: undefined;
  DaySummary: undefined;
  AdultGate: undefined;
  Demo: undefined;
  TaskRun: { taskId: string };
  TaskResult: {
    taskId: string;
    reward: number;
    earned: number;
    points: number;
    sceneCoins: number;
    /** First completion of a pinned Урок: the result leads to Итоги дня. */
    dayEnded: boolean;
  };
  Stub: { destination: StubDestination };
};
