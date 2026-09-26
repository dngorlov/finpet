/** Значки a child can put on a Своя цель. A grid, the way Notion picks a page icon. */
export const GOAL_EMOJI_GROUPS: readonly { title: string; emojis: readonly string[] }[] = [
  {
    title: "Радость",
    emojis: ["⭐", "🌟", "✨", "🎯", "🎁", "🎈", "🎉", "🏆", "💎", "👑", "🌈", "💫"],
  },
  {
    title: "Игры",
    emojis: ["🧸", "🎮", "🧩", "🪁", "🎲", "🏀", "⚽", "🛹", "🚲", "🛴", "🎸", "🎨"],
  },
  {
    title: "Вещи",
    emojis: ["⌚", "📱", "💻", "🎧", "📚", "✏️", "🖍️", "🎒", "🧢", "👟", "🕶️", "📷"],
  },
  {
    title: "Животные",
    emojis: ["🐶", "🐱", "🐰", "🦊", "🐻", "🐼", "🐨", "🐸", "🦄", "🐝", "🦋", "🐢"],
  },
  {
    title: "Еда",
    emojis: ["🍦", "🍩", "🍪", "🎂", "🍕", "🍓", "🍉", "🍿", "🧃", "🍫"],
  },
];

export const GOAL_EMOJIS: readonly string[] = GOAL_EMOJI_GROUPS.flatMap((group) => [...group.emojis]);

export const DEFAULT_GOAL_EMOJI = "⭐";
