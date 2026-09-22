import { loadContent } from "../content";

describe("loadContent", () => {
  const content = loadContent();

  it("accepts contentVersion 1 across every file", () => {
    expect(content.contentVersion).toBe(1);
  });

  it("ships the eight catalog items with the settled prices and pet effects", () => {
    const byId = Object.fromEntries(content.catalog.map((item) => [item.id, item]));

    expect(content.catalog).toHaveLength(8);
    expect(byId.lunch).toMatchObject({
      name: "Обед",
      kind: "mandatory",
      price: 12,
      effect: { meter: "care", delta: 10 },
    });
    expect(byId.school).toMatchObject({ kind: "mandatory", price: 10, effect: { meter: "care", delta: 5 } });
    expect(byId.transport).toMatchObject({ kind: "mandatory", price: 8, effect: { meter: "care", delta: 5 } });
    expect(byId.medicine).toMatchObject({ kind: "mandatory", price: 15, effect: { meter: "care", delta: 20 } });
    expect(byId.candy).toMatchObject({ kind: "optional", price: 5, effect: { meter: "mood", delta: 5 } });
    expect(byId.stickers).toMatchObject({ kind: "optional", price: 7, effect: { meter: "mood", delta: 6 } });
    expect(byId.cinema).toMatchObject({ kind: "optional", price: 20, effect: { meter: "mood", delta: 12 } });
    expect(byId.toy).toMatchObject({ kind: "optional", price: 25, effect: { meter: "mood", delta: 10 } });
  });

  it("ships a Счета cycle of mandatory items with a medicine day", () => {
    const mandatory = new Set(content.catalog.filter((item) => item.kind === "mandatory").map((item) => item.id));
    expect(content.bills.length).toBeGreaterThanOrEqual(5);
    for (const day of content.bills) {
      for (const id of day.items) expect(mandatory.has(id)).toBe(true);
    }
    expect(content.bills[0].items).toEqual(["lunch", "transport"]);
    expect(content.bills.some((day) => day.items.includes("medicine") && day.note)).toBe(true);
  });

  it("ships the three preset goals", () => {
    expect(content.goals.map((g) => [g.name, g.cost])).toEqual([
      ["Скейтборд", 90],
      ["Телескоп", 160],
      ["Велосипед", 240],
    ]);
  });

  it("ships the eleven Словарик terms including План and seven Как играть steps", () => {
    expect(content.terms.map((t) => t.term)).toEqual([
      "Баланс",
      "Копилка",
      "Цель",
      "Пособие",
      "План",
      "Обязательные расходы",
      "Желаемые расходы",
      "Забота",
      "Настроение",
      "Этап",
      "Игровой день",
    ]);
    expect(content.terms).toHaveLength(11);
    expect(content.terms.find((t) => t.id === "plan")).toEqual({
      id: "plan",
      term: "План",
      definition:
        "Обещание, как разделить сегодняшние монеты: обязательное, желаемое и копилка. Подтвердить план монеты не тратит.",
    });
    expect(content.hints.map((hint) => hint.id)).toEqual([
      "main-plan",
      "plan-buckets",
      "main-shop",
      "shop-lunch",
      "main-savings",
      "savings-deposit",
      "main-task",
    ]);
    expect(content.hints.find((hint) => hint.id === "plan-buckets")?.body).toBe(
      "Раздели монеты на три кучки. Это обещание, не покупка.",
    );
  });

  it("ships six playable task scripts plus the backpack correction, every option explained", () => {
    const playable = content.tasks.filter((t) => !t.correction);
    expect(playable.map((t) => t.id)).toEqual([
      "budget_first_plan",
      "budget_backpack",
      "savings_dream_jar",
      "savings_big_sale",
      "payments_two_prices",
      "payments_receipt",
    ]);
    expect(content.tasks.some((t) => t.id === "budget_fix_backpack" && t.correction)).toBe(true);
    const backpackEgg = content.tasks
      .find((t) => t.id === "budget_backpack")
      ?.nodes[0]?.options.find((o) => o.spawnTask === "budget_fix_backpack");
    expect(backpackEgg?.effects).toEqual([
      { meter: "mood", delta: 5 },
      { meter: "care", delta: -15 },
    ]);

    for (const task of content.tasks) {
      for (const node of task.nodes) {
        for (const option of node.options) {
          expect(option.explanation.length).toBeGreaterThan(0);
          expect(["good", "warn", "bad"]).toContain(option.verdict);
        }
      }
    }
  });
});
