import {
  chooseOption,
  earnedReward,
  missionPrerequisite,
  rewardLeft,
  rewardTopUp,
  scoredUnits,
  sortVerdict,
  startTask,
  taskRewardDue,
  unlockedTasks,
  type TaskContent,
} from "../tasks";

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

describe("mission unlock chain", () => {
  const tasks: TaskContent[] = [
    fixture({ id: "payments_2", topic: "payments", order: 2 }),
    fixture({ id: "budget_1", topic: "budget", order: 1 }),
    fixture({ id: "savings_1", topic: "savings", order: 1 }),
    fixture({ id: "budget_2", topic: "budget", order: 2 }),
    fixture({ id: "payments_1", topic: "payments", order: 1 }),
    fixture({ id: "bonus", topic: "payments", order: 3, requires: "payments_2" }),
    fixture({ id: "budget_fix_backpack", topic: "budget", correction: true }),
  ];
  const open = (done: string[], demo = false) => unlockedTasks(tasks, new Set(done), demo).map((t) => t.id);

  it("opens only budget #1 at first and hides correction tasks", () => {
    expect(open([])).toEqual(["budget_1"]);
  });

  it("after budget #1 opens #1 of every topic and budget #2", () => {
    expect(open(["budget_1"])).toEqual(["budget_1", "budget_2", "savings_1", "payments_1"]);
  });

  it("then goes strictly in order inside a topic, and `requires` overrides the chain", () => {
    expect(open(["budget_1", "payments_1"])).toContain("payments_2");
    expect(open(["budget_1", "payments_1"])).not.toContain("bonus");
    expect(open(["budget_1", "payments_1", "payments_2"])).toContain("bonus");
    expect(missionPrerequisite(tasks[5]!, tasks)?.id).toBe("payments_2");
    expect(missionPrerequisite(tasks[1]!, tasks)).toBeNull();
  });

  it("opens every mission at once in Демо-режим, with no calendar gate", () => {
    expect(open([], true)).toEqual(["budget_1", "budget_2", "savings_1", "payments_1", "payments_2", "bonus"]);
  });
});

describe("score-based reward", () => {
  const quiz = fixture({ id: "q", topic: "budget", reward: 15 });

  it("pays the share of first-try points: right 1, «с ценой» ½, wrong 0", () => {
    expect(scoredUnits(quiz)).toBe(2);
    expect(earnedReward(quiz, ["good", "good"])).toBe(15);
    expect(earnedReward(quiz, ["good", "warn"])).toBe(11);
    expect(earnedReward(quiz, ["bad", "bad"])).toBe(0);
  });

  it("counts sort items and skips cards", () => {
    const game: TaskContent = {
      ...fixture({ id: "g", topic: "budget", reward: 10 }),
      nodes: [
        { id: "c", kind: "card", text: "Бюджет — это план.", next: "s" },
        {
          id: "s",
          kind: "sort",
          text: "Нужно или хочется?",
          bins: ["Нужно", "Хочется"],
          next: "exit",
          items: [
            { label: "Обед", bin: 0, explanation: "Еда нужна." },
            { label: "Кино", bin: 1, explanation: "Можно отложить." },
          ],
        },
      ],
    };
    expect(scoredUnits(game)).toBe(2);
    expect(sortVerdict(game.nodes[1]!.items![0]!, 0)).toBe("good");
    expect(sortVerdict(game.nodes[1]!.items![1]!, 0)).toBe("bad");
    expect(earnedReward(game, ["good", "bad"])).toBe(5);
  });

  it("pays only the improvement over the best run and reports what is left", () => {
    expect(rewardTopUp(0, 11)).toBe(11);
    expect(rewardTopUp(11, 15)).toBe(4);
    expect(rewardTopUp(15, 8)).toBe(0);
    expect(rewardLeft(quiz, 11)).toBe(4);
    expect(rewardLeft(quiz, 15)).toBe(0);
  });
});
