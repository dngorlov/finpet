/** Магазин copy added with the shop-row redesign. Older shop strings stay in strings.ts. */
export const shopStrings = {
  tagPostponed: "Отложено",

  careWord: "сытость",
  moodWord: "настроение",
  /** «+10 сытость» */
  effectGain: (delta: number, meter: string) => `+${delta} ${meter}`,
  /** «не купишь: −15 сытость» */
  effectSkip: (delta: number, meter: string) => `не купишь: −${delta} ${meter}`,

  buy: "Купить",
  postpone: "Отложить",
  restore: "Вернуть",
  buyA11y: (name: string) => `Купить ${name}`,
  postponeA11y: (name: string) => `Отложить ${name}`,
  restoreA11y: (name: string) => `Вернуть ${name}`,

  postponeTitle: (name: string) => `Отложить ${name}?`,
  postponeDueExplain: (name: string, meter: string, delta: number, shared: boolean) =>
    shared
      ? `Если не купить ${name} до конца дня, ${meter} −${delta} один раз.`
      : `Если не купить ${name} до конца дня, ${meter} −${delta}.`,
  postponeDueLater: "Можно вернуться и купить позже, пока день не закончился.",
  postponeKeepPlan: "Деньги останутся в плане. Потратишь их позже или на другое.",
  postponeKeep: "Деньги останутся у тебя.",
  postponeNoEffect: "Питомец ничего не потеряет.",
} as const;
