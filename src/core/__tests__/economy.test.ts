import {
  applyMeterDelta,
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
