/** A Своя цель the child writes: name, emoji значок, and a price. */
export const CUSTOM_GOAL_NAME_MAX = 24;
export const CUSTOM_GOAL_PRICE_MAX = 999;
/** Счастье when a Своя цель is bought from Копилка. */
export const CUSTOM_GOAL_MOOD = 10;

const CUSTOM_GOAL_ID = /^custom:([^:]+):(\d+):(.*)$/;

export function parseCustomGoalDraft(input: {
  name: string;
  icon: string;
  price: number;
}): { name: string; icon: string; price: number } {
  const name = input.name.trim();
  if (name.length < 1 || name.length > CUSTOM_GOAL_NAME_MAX) {
    throw new Error("Название цели");
  }
  const icon = input.icon.trim();
  if (icon.length < 1 || icon.length > 16) {
    throw new Error("Значок цели");
  }
  if (!Number.isInteger(input.price) || input.price < 1 || input.price > CUSTOM_GOAL_PRICE_MAX) {
    throw new Error("Цена цели");
  }
  return { name, icon, price: input.price };
}

/** Stable item id: unique key, the price that was bought, and the name for Журнал. */
export function customGoalItemId(id: string, price: number, name: string): string {
  return `custom:${id}:${price}:${encodeURIComponent(name)}`;
}

export function readCustomGoalItem(itemId: string): { id: string; price: number; name: string } | null {
  const match = CUSTOM_GOAL_ID.exec(itemId);
  if (!match) return null;
  const price = Number(match[2]);
  if (!Number.isInteger(price) || price <= 0) return null;
  let name: string;
  try {
    name = decodeURIComponent(match[3]);
  } catch {
    return null;
  }
  if (!name) return null;
  return { id: match[1], price, name };
}
