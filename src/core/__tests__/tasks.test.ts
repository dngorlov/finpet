import { chooseOption, startTask, taskRewardDue, unlockedTasks, type TaskContent } from "../tasks";

function fixture(overrides: Partial<TaskContent> & Pick<TaskContent, "id" | "topic">): TaskContent {
  return {
    title: overrides.title ?? overrides.id,
    reward: 10,
    intro: "intro",
    nodes: [
      {
        id: "n1",
        text: "С чего начнёшь?",
        options: [
          {
            label: "Купить обед",
            next: "n2",
            verdict: "good",
            explanation: "Сначала нужды.",
            effect: { meter: "care", delta: 5 },
          },
          {
            label: "Мороженое",
            next: "retry",
            verdict: "bad",
            explanation: "На обед не хватает.",
          },
        ],
      },
      {
        id: "n2",
        text: "Сколько в копилку?",
        options: [
          {
            label: "5 монет",
            next: "exit",
            verdict: "good",
            explanation: "Копилка растёт.",
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("task runner", () => {
  const task = fixture({ id: "budget_first_plan", topic: "budget" });

  it("starts on the first node and returns every option with its verdict and explanation", () => {
    const start = startTask(task);

    expect(start.nodeId).toBe("n1");
    expect(start.options).toHaveLength(2);
    expect(start.options[0]?.explanation).toBe("Сначала нужды.");
  });

  it("moves to the next node on a good choice and retries the same node on a bad one", () => {
    expect(chooseOption(task, "n1", 0)).toMatchObject({
      next: "n2",
      verdict: "good",
      explanation: "Сначала нужды.",
      effects: [{ meter: "care", delta: 5 }],
    });
    expect(chooseOption(task, "n1", 1)).toMatchObject({
      next: "retry",
      verdict: "bad",
      explanation: "На обед не хватает.",
    });
  });

  it("pays the reward only on the first correct completion", () => {
    expect(taskRewardDue(false)).toBe(10);
    expect(taskRewardDue(true)).toBe(0);
  });
});

describe("task unlock", () => {
  const tasks: TaskContent[] = [
    fixture({ id: "payments_receipt", topic: "payments" }),
    fixture({ id: "budget_first_plan", topic: "budget" }),
    fixture({ id: "savings_dream_jar", topic: "savings" }),
    fixture({
      id: "budget_fix_backpack",
      topic: "budget",
      correction: true,
    }),
  ];

  it("opens one new topic-ordered task per day in normal play and hides correction tasks", () => {
    expect(unlockedTasks(tasks, 1, false).map((t) => t.id)).toEqual(["budget_first_plan"]);
    expect(unlockedTasks(tasks, 2, false).map((t) => t.id)).toEqual([
      "budget_first_plan",
      "savings_dream_jar",
    ]);
  });

  it("opens every non-correction task from the start in Демо-режим", () => {
    expect(unlockedTasks(tasks, 1, true).map((t) => t.id)).toEqual([
      "budget_first_plan",
      "savings_dream_jar",
      "payments_receipt",
    ]);
  });
});
