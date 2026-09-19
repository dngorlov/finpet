export const TOUR_BEATS = [
  { id: "main-plan", route: "Main", advance: "tap" },
  { id: "plan-buckets", route: "Plan", advance: "next" },
  { id: "main-shop", route: "Main", advance: "tap" },
  { id: "shop-lunch", route: "Shop", advance: "next" },
  { id: "main-savings", route: "Main", advance: "tap" },
  { id: "savings-deposit", route: "Savings", advance: "next" },
  { id: "main-task", route: "Main", advance: "next" },
] as const;

export type TourBeatId = (typeof TOUR_BEATS)[number]["id"];
export type TourBeatRoute = (typeof TOUR_BEATS)[number]["route"];
export type TourAdvance = (typeof TOUR_BEATS)[number]["advance"];

export type TourAnchorRect = { x: number; y: number; width: number; height: number };

export const TASK_BEAT_ID: TourBeatId = "main-task";

export function beatById(id: TourBeatId) {
  return TOUR_BEATS.find((item) => item.id === id);
}

export function hubTapRoute(id: TourBeatId): "Plan" | "Shop" | "Savings" | null {
  if (id === "main-plan") return "Plan";
  if (id === "main-shop") return "Shop";
  if (id === "main-savings") return "Savings";
  return null;
}

export function tourScrollsToEnd(id: TourBeatId) {
  return id === "main-plan" || id === "main-shop" || id === "main-savings" || id === "savings-deposit";
}
