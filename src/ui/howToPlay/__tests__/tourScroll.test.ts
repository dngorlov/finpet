import { TOUR_CHROME_OVERLAP, tourCenterScrollY } from "../beats";

describe("tourCenterScrollY", () => {
  it("scrolls a below-the-fold Магазин tile into the open band under the chrome", () => {
    expect(tourCenterScrollY(800, 120, 640, TOUR_CHROME_OVERLAP)).toBe(504);
  });

  it("does not scroll a tile that already sits in the open band", () => {
    expect(tourCenterScrollY(0, 100, 640, TOUR_CHROME_OVERLAP)).toBe(0);
  });
});
