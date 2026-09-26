import type { BudgetBucket } from "./tasks";

/** How many coins the purse draws, however big the wallet is. */
export const PURSE_PIPS = 10;

export type ShopPose = "idle" | "happy" | "sad";

export type SortReaction = {
  streak: number;
  pose: ShopPose;
  trick: boolean;
  /** Preview only: a need feeds satiety, a want feeds mood. Not the real meters. */
  meter: "care" | "mood" | null;
};

/** Seeded shuffle. The same seed always lays out the same shop. */
export function shuffledCopy<T>(items: readonly T[], seed: number): T[] {
  const next = [...items];
  let state = seed >>> 0 || 1;
  const rand = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rand() * (i + 1));
    const swap = next[i]!;
    next[i] = next[j]!;
    next[j] = swap;
  }
  return next;
}

/** Pick-cards change places. The wallet tile stays where the lesson put it. */
export function shufflePickTiles<T extends { pick?: boolean }>(tiles: readonly T[], seed: number): T[] {
  const picks = shuffledCopy(
    tiles.filter((tile) => tile.pick),
    seed,
  );
  let index = 0;
  return tiles.map((tile) => (tile.pick ? picks[index++]! : tile));
}

/**
 * A replay moves the visitor a round or two later, still inside a short
 * savings run (the authored round is early).
 */
export function shiftTemptations<T extends { round: number }>(items: readonly T[], seed: number): T[] {
  const shift = (Math.abs(seed) % 2) + 1;
  return items.map((item) => ({ ...item, round: item.round + shift }));
}

type ReplayNode = {
  id: string;
  kind?: string;
  items?: readonly unknown[];
  scene?: readonly { pick?: boolean }[];
  temptations?: readonly { round: number }[];
};

type AnswerNode = {
  id: string;
  kind?: string;
  options?: readonly unknown[];
};

function salt(seed: number, id: string): number {
  let hash = seed >>> 0 || 1;
  for (let i = 0; i < id.length; i += 1) {
    hash = (Math.imul(hash, 33) + id.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

/**
 * Choice buttons change places on every visit, so the right answer is not
 * always in the same slot. A retry keeps this visit's order. Sort chips,
 * shop cards, and the visitor stay with `replayVariety`.
 */
export function shuffleAnswers<T extends AnswerNode>(nodes: readonly T[], seed: number): T[] {
  return nodes.map((node) => {
    const kind = node.kind ?? "choice";
    if (kind !== "choice" || !node.options || node.options.length < 2) return node;
    return { ...node, options: shuffledCopy(node.options, salt(seed, node.id)) };
  });
}

/** Same lesson, new shelves: sort order, shop cards, and when the visitor walks in. */
export function replayVariety<T extends ReplayNode>(nodes: readonly T[], seed: number): T[] {
  return nodes.map((node) => {
    if (node.kind === "sort" && node.items) {
      return { ...node, items: shuffledCopy(node.items, seed + node.id.length) };
    }
    if (node.kind === "choice" && node.scene?.some((tile) => tile.pick)) {
      return { ...node, scene: shufflePickTiles(node.scene, seed + node.id.length) };
    }
    if (node.kind === "steps" && node.temptations && node.temptations.length > 0) {
      return { ...node, temptations: shiftTemptations(node.temptations, seed + node.id.length) };
    }
    return node;
  });
}

/** Filled pips left in the purse. Overspend draws an empty purse. */
export function purseFilled(budget: number, spent: number): number {
  if (budget <= 0) return 0;
  const left = Math.max(0, budget - spent);
  return Math.round((left / budget) * PURSE_PIPS);
}

/** An empty jar worries once another jar already holds coins. */
export function jarIsWorried(value: number, siblingSum: number): boolean {
  return value === 0 && siblingSum > 0;
}

export function sortReaction(previousStreak: number, verdict: "good" | "bad", bin: number): SortReaction {
  if (verdict !== "good") {
    return { streak: 0, pose: "sad", trick: false, meter: null };
  }
  const streak = previousStreak + 1;
  return {
    streak,
    pose: "happy",
    trick: streak % 3 === 0,
    meter: bin === 0 ? "care" : "mood",
  };
}

export function otherJars(split: Record<BudgetBucket, number>, bucket: BudgetBucket): number {
  return split.mandatory + split.wants + split.savings - split[bucket];
}
