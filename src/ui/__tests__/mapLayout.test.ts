import {
  containedMapSize,
  dockCap,
  dockOverflows,
  naturalDockHeight,
} from "../screens/mapLayout";

describe("Карта заданий layout", () => {
  const pad = 16;

  it("caps a long lesson dock so the map keeps the space above it", () => {
    const outerHeight = 700;
    const cap = dockCap(outerHeight, pad);
    const natural = naturalDockHeight({ copyHeight: 420, actionHeight: 56, extrasHeight: 80 });

    expect(dockOverflows(natural, cap)).toBe(true);
    expect(cap).toBeLessThan(natural);

    const header = 40;
    const gap = 8;
    const slotHeight = outerHeight - pad * 2 - header - cap - gap;
    const map = containedMapSize(360, slotHeight);

    expect(map.height).toBeGreaterThan(280);
    expect(map.height).toBeGreaterThan(cap / 2);
    expect(map.width / map.height).toBeCloseTo(3 / 4);
  });

  it("lets a short lesson dock shrink so the map can grow to the art's aspect", () => {
    const cap = dockCap(700, pad);
    const natural = naturalDockHeight({ copyHeight: 96, actionHeight: 56, extrasHeight: 0 });

    expect(dockOverflows(natural, cap)).toBe(false);
    expect(natural).toBeLessThan(cap);

    const map = containedMapSize(360, 480);
    expect(map).toEqual({ width: 360, height: 480 });
  });

  it("fits the map inside a short slot without stretching it", () => {
    const map = containedMapSize(300, 200);
    expect(map.height).toBe(200);
    expect(map.width).toBeCloseTo(150);
    expect(containedMapSize(0, 200)).toEqual({ width: 0, height: 0 });
  });
});
