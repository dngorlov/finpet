import { shuffleAnswers } from "../shopPlay";

const answers = [
  { label: "Потратить все" },
  { label: "Не считать" },
  { label: "Отложить часть" },
  { label: "Случайные покупки" },
];

describe("shuffleAnswers", () => {
  it("keeps every answer and repeats the same order for the same seed", () => {
    const nodes = [{ id: "q1", options: answers }];
    const once = shuffleAnswers(nodes, 7);
    const again = shuffleAnswers(nodes, 7);
    const labels = once[0]?.options?.map((option) => option.label);

    expect(labels).toEqual(again[0]?.options?.map((option) => option.label));
    expect([...(labels ?? [])].sort()).toEqual(answers.map((option) => option.label).sort());
    expect(once[0]?.options?.every((option) => answers.includes(option))).toBe(true);
  });

  it("does not leave a multi-answer question in the written order", () => {
    const nodes = [{ id: "q1", options: answers }];
    const written = answers.map((option) => option.label).join();
    const moved = [1, 2, 3, 4, 5, 6, 7, 8].some((seed) => {
      const labels = shuffleAnswers(nodes, seed)[0]?.options?.map((option) => option.label).join();
      return labels !== written;
    });
    expect(moved).toBe(true);
  });

  it("leaves a single answer and a sort board where they were written", () => {
    const only = { id: "n1", options: [{ label: "Починить рюкзак" }] };
    const board = { id: "g1", kind: "sort" as const, items: ["Обед", "Мячик"] };
    const next = shuffleAnswers([only, board], 3);
    expect(next[0]).toBe(only);
    expect(next[1]).toBe(board);
  });
});
