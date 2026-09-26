import { binAtPoint, chipDropPoint } from "../games/sortGeometry";

const baskets = [
  { x: 0, y: 100, width: 100, height: 80 },
  { x: 120, y: 100, width: 100, height: 80 },
];

describe("корзина под пальцем", () => {
  it("выбирает корзину, в которой лежит точка", () => {
    expect(binAtPoint(40, 140, baskets)).toBe(0);
    expect(binAtPoint(180, 140, baskets)).toBe(1);
  });

  it("промахивается мимо корзин", () => {
    expect(binAtPoint(40, 40, baskets)).toBeNull();
  });

  it("в зоне допуска берёт ближайший центр", () => {
    // 108 is just past the first basket and inside the second basket's slop.
    expect(binAtPoint(108, 140, baskets, 16)).toBe(0);
  });

  it("игнорирует пустую рамку", () => {
    expect(binAtPoint(10, 10, [undefined, { x: 0, y: 0, width: 20, height: 20 }])).toBe(1);
  });
});

describe("центр фишки", () => {
  it("без размера считает точкой сам палец", () => {
    expect(
      chipDropPoint({
        pageX: 50,
        pageY: 80,
        originX: 10,
        originY: 10,
        grabX: 4,
        grabY: 6,
        width: 0,
        height: 0,
      }),
    ).toEqual({ pageX: 50, pageY: 80 });
  });

  it("с размером берёт центр фишки после сдвига", () => {
    expect(
      chipDropPoint({
        pageX: 130,
        pageY: 160,
        originX: 100,
        originY: 100,
        grabX: 10,
        grabY: 20,
        width: 80,
        height: 40,
      }),
    ).toEqual({ pageX: 160, pageY: 160 });
  });
});
