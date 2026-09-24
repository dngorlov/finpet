import { loadContent } from "../content";

describe("loadContent", () => {
  const content = loadContent();

  it("accepts contentVersion 1 across every file", () => {
    expect(content.contentVersion).toBe(1);
  });

  it("ships eleven catalog items including three one-shot Желаемые", () => {
    const byId = Object.fromEntries(content.catalog.map((item) => [item.id, item]));

    expect(content.catalog).toHaveLength(11);
    expect(byId.lunch).toMatchObject({
      name: "Обед",
      kind: "mandatory",
      price: 12,
      effect: { meter: "care", delta: 10 },
    });
    expect(byId.school).toMatchObject({ kind: "mandatory", price: 10, effect: { meter: "care", delta: 5 } });
    expect(byId.transport).toMatchObject({ kind: "mandatory", price: 8, effect: { meter: "care", delta: 5 } });
    expect(byId.medicine).toMatchObject({ kind: "mandatory", price: 15, effect: { meter: "care", delta: 20 } });
    expect(byId.candy).toMatchObject({
      kind: "optional",
      price: 5,
      effect: { meter: "mood", delta: 5 },
      once: false,
    });
    expect(byId.stickers).toMatchObject({ kind: "optional", price: 7, effect: { meter: "mood", delta: 6 }, once: false });
    expect(byId.cinema).toMatchObject({ kind: "optional", price: 20, effect: { meter: "mood", delta: 12 }, once: false });
    expect(byId.toy).toMatchObject({ kind: "optional", price: 25, effect: { meter: "mood", delta: 10 }, once: false });
    expect(byId.skateboard).toMatchObject({
      name: "Скейтборд",
      kind: "optional",
      price: 90,
      effect: { meter: "mood", delta: 12 },
      once: true,
    });
    expect(byId.telescope).toMatchObject({
      name: "Телескоп",
      kind: "optional",
      price: 160,
      effect: { meter: "mood", delta: 15 },
      once: true,
    });
    expect(byId.bike).toMatchObject({
      name: "Велосипед",
      kind: "optional",
      price: 240,
      effect: { meter: "mood", delta: 18 },
      once: true,
    });
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
    expect(content.terms.find((t) => t.id === "savings")).toEqual({
      id: "savings",
      term: "Копилка",
      definition:
        "Горшочек монет на Цель. Они уходят оттуда «Забрать» или когда покупаешь эту Цель.",
    });
    expect(content.terms.find((t) => t.id === "goal")).toEqual({
      id: "goal",
      term: "Цель",
      definition:
        "Одно желаемое из магазина, на которое копилка копит. Одновременно бывает только одна. Обязательные не могут быть целью.",
    });
    expect(content.terms.find((t) => t.id === "optional")).toEqual({
      id: "optional",
      term: "Желаемые расходы",
      definition:
        "Покупки не из обязательных: они поднимают настроение. Некоторые можно купить только один раз.",
    });
    expect(content.terms.find((t) => t.id === "mood")).toEqual({
      id: "mood",
      term: "Настроение",
      definition: "Как радуется питомец. Растёт от желаемых покупок.",
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

  it("ships Савва's six lessons plus three bonus mini-games on the map, every answer explained", () => {
    const playable = content.tasks.filter((t) => !t.correction);
    expect(playable.map((t) => t.id)).toEqual([
      "budget_what",
      "budget_plan",
      "savings_what",
      "savings_where",
      "payments_pay",
      "payments_shop",
      "payments_sale_trap",
      "payments_cheaper",
      "payments_price_hunt",
    ]);
    for (const task of playable) {
      expect(task.pin).toBeDefined();
      expect(task.order).toBeGreaterThan(0);
    }
    expect(playable.filter((t) => t.requires === "payments_shop")).toHaveLength(3);
    expect(content.tasks.some((t) => t.id === "budget_fix_backpack" && t.correction)).toBe(true);
    const spawn = content.tasks
      .find((t) => t.id === "budget_plan")
      ?.nodes.flatMap((n) => n.options ?? [])
      .find((o) => o.spawnTask === "budget_fix_backpack");
    expect(spawn?.effects).toEqual([
      { meter: "mood", delta: 5 },
      { meter: "care", delta: -15 },
    ]);

    // Т/З: ≥6 Заданий over 3 topics, each with a right and a wrong answer.
    for (const topic of ["budget", "savings", "payments"] as const) {
      expect(playable.filter((t) => t.topic === topic).length).toBeGreaterThanOrEqual(2);
    }
    for (const task of content.tasks) {
      const verdicts = new Set<string>();
      for (const node of task.nodes) {
        for (const option of node.options ?? []) {
          expect(option.explanation.length).toBeGreaterThan(0);
          verdicts.add(option.verdict);
        }
        for (const item of node.items ?? []) {
          expect(item.explanation.length).toBeGreaterThan(0);
          expect(item.bin).toBeLessThan(node.bins?.length ?? 0);
        }
        // Every sort item has a right basket and at least one wrong one.
        if (node.kind === "sort") ["good", "bad"].forEach((v) => verdicts.add(v));
      }
      if (!task.correction) expect(verdicts.size).toBeGreaterThan(1);
    }
  });

  it("reaches every node of every Задание from its start, and every Задание can end", () => {
    for (const task of content.tasks) {
      const byId = new Map(task.nodes.map((node) => [node.id, node]));
      const seen = new Set<string>();
      const stack = [task.nodes[0]!.id];
      let canExit = false;
      while (stack.length > 0) {
        const id = stack.pop()!;
        if (seen.has(id)) continue;
        seen.add(id);
        const node = byId.get(id)!;
        const targets = node.kind === "card" || node.kind === "sort" ? [node.next!] : (node.options ?? []).map((o) => o.next);
        for (const next of targets) {
          if (next === "exit") canExit = true;
          else if (next !== "retry") stack.push(next);
        }
      }
      expect({ task: task.id, reached: seen.size }).toEqual({ task: task.id, reached: task.nodes.length });
      expect({ task: task.id, canExit }).toEqual({ task: task.id, canExit: true });
    }
  });

  it("keeps the savings test and the Нужно или хочется? game from the scenario", () => {
    const savings = content.tasks.find((t) => t.id === "savings_what");
    expect(savings?.nodes.filter((n) => (n.kind ?? "choice") === "choice")).toHaveLength(4);
    const sort = content.tasks.find((t) => t.id === "budget_what")?.nodes.find((n) => n.kind === "sort");
    expect(sort?.bins).toEqual(["Нужно", "Хочется"]);
    expect(sort?.items?.length).toBeGreaterThanOrEqual(6);
  });

});
