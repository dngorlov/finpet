import { METERS } from "../core/config";

/** Магазин copy added with the shop-row redesign. Older shop strings stay in strings.ts. */
export const shopStrings = {
  tagPostponed: "Отложено",

  careWord: "сытость",
  moodWord: "счастье",
  /** «+10 сытость» */
  effectGain: (delta: number, meter: string) => `+${delta} ${meter}`,
  /** Info button on the Дом day pill. The rule itself stays hidden until the tap. */
  dailyDropHint: "Подсказка про день",
  /** Invisible catch over Дом. A tap anywhere but the tip closes it. */
  dailyDropClose: "Закрыть подсказку",
  /** Standing rule under the Магазин tabs, on План, and in the Дом day tip. */
  dailyRule: `Каждый день сытость -${METERS.dailyCareDrop} и счастье -${METERS.dailyMoodDrop}. Покупка в Магазине это отменяет.`,
  dailyCare: (n: number) => `сытость -${n}`,
  dailyMood: (n: number) => `счастье -${n}`,

  buy: "Купить",
  postpone: "Отложить",
  restore: "Вернуть",
  buyA11y: (name: string) => `Купить ${name}`,
  postponeA11y: (name: string) => `Отложить ${name}`,
  restoreA11y: (name: string) => `Вернуть ${name}`,

  postponeTitle: (name: string) => `Отложить ${name}?`,
  /** «Каждый день сытость -15 и счастье -15. Покупка это отменяет.» */
  postponeDaily: (phrase: string) => `Каждый день ${phrase}. Покупка это отменяет.`,
  postponeDueLater: "Можно вернуться и купить позже, пока день не закончился.",
  postponeKeepPlan: "Деньги останутся в плане. Потратишь их позже или на другое.",
  postponeKeep: "Деньги останутся у тебя.",
  postponeNoEffect: "Питомец ничего не потеряет.",
} as const;
