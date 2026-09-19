export const TOUR_BEATS = [
  { id: "main-plan", route: "Main" },
  { id: "plan-buckets", route: "Plan" },
  { id: "main-shop", route: "Main" },
  { id: "shop-lunch", route: "Shop" },
  { id: "main-savings", route: "Main" },
  { id: "savings-deposit", route: "Savings" },
  { id: "main-task", route: "Main" },
] as const;

export type TourBeatId = (typeof TOUR_BEATS)[number]["id"];
export type TourBeatRoute = (typeof TOUR_BEATS)[number]["route"];

export type TourAnchorRect = { x: number; y: number; width: number; height: number };

export const TASK_BEAT_ID: TourBeatId = "main-task";
