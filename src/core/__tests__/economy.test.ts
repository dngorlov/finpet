import {
  applyMeterDelta,
  billsForDay,
  billsTotal,
  planKept,
  planMandatoryFloor,
  checkPurchase,
  dayCloseMeterDeltas,
  validatePlan,
} from "../economy";

describe("validatePlan", () => {
  it("accepts buckets that sum to the available amount", () => {
    const result = validatePlan({ mandatory: 12, optional: 8, savings: 10 }, 30);

    expect(result).toEqual({ ok: true, total: 30, remainder: 0 });
  });

  it("accepts buckets under the available amount and reports remainder", () => {
    const result = validatePlan({ mandatory: 12, optional: 5, savings: 10 }, 30);

    expect(result).toEqual({ ok: true, total: 27, remainder: 3 });
  });

  it("blocks confirmation when the buckets exceed the available amount", () => {
    const result = validatePlan({ mandatory: 12, optional: 8, savings: 10 }, 20);

    expect(result).toEqual({ ok: false, total: 30, remainder: -10 });
  });
});

describe("checkPurchase", () => {
  it("allows a purchase that exactly matches the balance", () => {
    expect(checkPurchase(25, 25)).toEqual({ status: "ok" });
  });

  it("rejects an over-balance purchase and reports how many coins are missing", () => {
    expect(checkPurchase(20, 25)).toEqual({ status: "blocked", missing: 5 });
  });
});

describe("day-close meters", () => {
  it("drops Забота by 15 when a mandatory item was skipped", () => {
    expect(
      dayCloseMeterDeltas({ missedMandatory: true, optionalSpend: 0, optionalPlan: 10 }),
    ).toEqual({ care: -15, mood: 0 });
  });

  it("drops Настроение by 5 when optional spend exceeds the plan bucket", () => {
    expect(
      dayCloseMeterDeltas({ missedMandatory: false, optionalSpend: 12, optionalPlan: 7 }),
    ).toEqual({ care: 0, mood: -5 });
  });

  it("does not punish optional spend when the day had no confirmed plan", () => {
    expect(
      dayCloseMeterDeltas({ missedMandatory: false, optionalSpend: 12, optionalPlan: null }),
    ).toEqual({ care: 0, mood: 0 });
  });

  it("clamps meters to 0–100", () => {
    expect(applyMeterDelta(10, -15)).toBe(0);
    expect(applyMeterDelta(95, 12)).toBe(100);
  });
});

describe("Счета and the План floor", () => {
  const cycle = [{ items: ["lunch"] }, { items: ["lunch", "medicine"], note: "Питомец простыл" }];
  const catalog = [
    { id: "lunch", price: 12 },
    { id: "medicine", price: 15 },
  ];

  it("repeats the Счета cycle by Игровой день", () => {
    expect(billsForDay(1, cycle).items).toEqual(["lunch"]);
    expect(billsForDay(2, cycle).note).toBe("Питомец простыл");
    expect(billsForDay(3, cycle).items).toEqual(["lunch"]);
    expect(billsForDay(1, [])).toEqual({ items: [] });
  });

  it("sums today's Счета and clamps the floor to what the child has", () => {
    expect(billsTotal(billsForDay(2, cycle), catalog)).toBe(27);
    expect(planMandatoryFloor(27, 100)).toBe(27);
    expect(planMandatoryFloor(27, 10)).toBe(10);
  });

  it("rejects a План whose Обязательные are under the floor", () => {
    expect(validatePlan({ mandatory: 5, optional: 0, savings: 0 }, 100, 12).ok).toBe(false);
    expect(validatePlan({ mandatory: 12, optional: 0, savings: 0 }, 100, 12).ok).toBe(true);
  });
});

describe("planKept", () => {
  const plan = { mandatory: 20, optional: 10, savings: 15 };

  it("holds when every bucket is followed", () => {
    expect(planKept({ plan, actual: { mandatory: 20, optional: 10, savings: 15 } })).toBe(true);
  });

  it("breaks on Желаемые overspend, a skipped Копилка, or no confirmed План", () => {
    expect(planKept({ plan, actual: { mandatory: 20, optional: 11, savings: 15 } })).toBe(false);
    expect(planKept({ plan, actual: { mandatory: 20, optional: 0, savings: 5 } })).toBe(false);
    expect(planKept({ plan: null, actual: { mandatory: 0, optional: 0, savings: 0 } })).toBe(false);
  });

  it("lets a Копилка-0 plan be kept — its cost shows in the Цель forecast, not as a penalty", () => {
    const greedy = { mandatory: 20, optional: 100, savings: 0 };
    expect(planKept({ plan: greedy, actual: { mandatory: 20, optional: 45, savings: 0 } })).toBe(true);
  });
});
