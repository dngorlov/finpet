import { checkDeposit, depositInterest, depositPayout, findOffer, maturesOnDay } from "../bank";

describe("Банк: вклад", () => {
  it("pays whole-coin interest, rounded down", () => {
    expect(depositInterest(100, 10)).toBe(10);
    expect(depositInterest(15, 10)).toBe(1);
    expect(depositPayout(100, 20)).toBe(120);
  });

  it("returns on the day after the term", () => {
    expect(maturesOnDay(2, 3)).toBe(5);
  });

  it("needs the minimum and enough Баланс", () => {
    expect(checkDeposit(50, 5)).toEqual({ status: "tooSmall", min: 10 });
    expect(checkDeposit(50, 60)).toEqual({ status: "blocked", missing: 10 });
    expect(checkDeposit(50, 50)).toEqual({ status: "ok" });
  });

  it("knows the two offers", () => {
    expect(findOffer("short")).toEqual({ id: "short", days: 3, ratePercent: 10 });
    expect(() => findOffer("nope")).toThrow();
  });
});
