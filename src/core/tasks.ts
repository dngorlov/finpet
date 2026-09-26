import { ECONOMY, FEATURES } from "./config";
import type { MeterKind } from "./economy";

/** Задание node graph as shipped in assets/content/tasks.json (§5.3). */
export type Verdict = "good" | "warn" | "bad";
export type NextRef = string | "retry" | "exit";

export interface TaskEffect {
  meter?: MeterKind;
  delta?: number;
  /** Coin delta from the scene itself (e.g. a refund); distinct from the +10 first-completion reward. */
  coins?: number;
}

/** A money bucket in the planning games (План и факт, Пересобери план). */
export type BudgetBucket = "mandatory" | "wants" | "savings";

/** Coins in each bucket. */
export type BudgetSplit = Record<BudgetBucket, number>;

/**
 * A picture tile above a question: a product with its price tag, a cash-desk
 * screen, a balance. `was` is a crossed-out old price; `sticker` a bright
 * shop label like «СКИДКА!».
 */
export interface SceneTile {
  icon?: string;
  label: string;
  value?: string;
  was?: string;
  sticker?: string;
  tone?: "plain" | "warn" | "good";
}

export interface TaskOption {
  label: string;
  /** Option shown as a big tile (Что дешевле?, Охота за ценником) instead of a text button. */
  icon?: string;
  /** Second line on a tile option, e.g. «5 штук». */
  hint?: string;
  /** План и факт: choosing this spends coins from a bucket. */
  spend?: { bucket: BudgetBucket; amount: number };
  next: NextRef;
  verdict: Verdict;
  explanation: string;
  effect?: TaskEffect;
  effects?: TaskEffect[];
  spawnTask?: string | null;
}

/**
 * A choice node asks a question (scored on the first answer); a card node
 * teaches — text plus «Дальше», never scored (Савва's обучающие карточки).
 */
/** One thing to sort in a «sort» mini-game (e.g. Нужно или хочется?). */
export interface SortItem {
  label: string;
  /** Emoji on the chip. */
  icon?: string;
  /** Index into the node's `bins`. */
  bin: number;
  explanation: string;
  /** Nudge after a wrong basket (default: «Подумай ещё раз…»). */
  hint?: string;
}

/** A thing to save for in «Шаг за шагом» / «Финансовая мечта». */
export interface SavingGoal {
  name: string;
  icon: string;
  price: number;
}

/** «Шаг за шагом»: before round `round` (1-based) a want tempts the pet. */
export interface Temptation {
  round: number;
  name: string;
  icon: string;
  price: number;
}

export interface TaskNode {
  id: string;
  kind?: "choice" | "card" | "sort" | "allocate" | "compare" | "replan" | "steps" | "dream";
  /** Card heading; choice nodes put the question in `text`. */
  title?: string;
  text: string;
  /** Choice nodes only. */
  options?: TaskOption[];
  /** Card and sort nodes: where to go after (a node id or "exit"). */
  next?: NextRef;
  /** Card nodes: label of the «Дальше» button (e.g. «Начать игру»). */
  button?: string;
  /** Sort nodes: the two (or more) baskets, e.g. ["Нужно", "Хочется"]. */
  bins?: string[];
  /** Sort nodes: chips to put into baskets; each first answer is scored. */
  items?: SortItem[];
  /** Choice nodes: picture tiles above the question. */
  scene?: SceneTile[];
  /** allocate / replan: coins to split. */
  total?: number;
  /** replan: the plan before the surprise. */
  plan?: BudgetSplit;
  /** replan: the surprise — one bucket grows by `delta` and is locked. */
  event?: { bucket: BudgetBucket; delta: number };
  /** replan: what it means when this bucket paid for the surprise. */
  outcomes?: Partial<Record<BudgetBucket, string>>;
  /** steps / dream: the goal, or goals to pick from (dream). */
  goal?: SavingGoal;
  goals?: SavingGoal[];
  /** steps / dream: coins already saved at the start. */
  saved?: number;
  /** steps / dream: contribution choices, e.g. [2, 5, 10]. */
  amounts?: number[];
  /** steps: coins the pet gets each round (a contribution cannot exceed it). */
  income?: number;
  temptations?: Temptation[];
  /** dream: days the child wants to reach the goal in. */
  days?: number;
}

/** Where a Задание sits on the map (fractions of the map image, 0–1). */
export interface MissionPin {
  x: number;
  y: number;
  district: string;
}

export interface TaskContent {
  id: string;
  topic: "budget" | "savings" | "payments";
  title: string;
  reward: number;
  intro: string;
  /** Correction tasks are spawned by safe errors (R9); hidden from the map. */
  correction?: boolean;
  /** 1-based position inside its topic — drives the unlock chain. */
  order?: number;
  /** 1 easy · 2 medium · 3 hard, shown as stars on the mission sheet. */
  difficulty?: number;
  /** One-line mission description for the map sheet. */
  description?: string;
  pin?: MissionPin;
  /** Explicit prerequisite id — overrides the topic chain. */
  requires?: string;
  /**
   * Mini-game that lives inside another Задание's map sheet instead of its own
   * pin; opens when that parent is completed.
   */
  parent?: string;
  /** Pin placeholder for a lesson still being written: visible, never playable. */
  comingSoon?: boolean;
  nodes: TaskNode[];
}

export const VERDICT_ICONS: Record<Verdict, string> = {
  good: "✅",
  warn: "🤔",
  bad: "⚠️",
};

export interface TaskStepResult {
  /** Node to show next: a node id, "retry" (same node), or "exit" (task over). */
  next: NextRef;
  verdict: Verdict;
  explanation: string;
  effects: TaskEffect[];
  spawnTask?: string | null;
}

/**
 * Generic task runner: a new task is data only (§5.3). Pure — the caller
 * applies effects/spawn/reward policy.
 */
export function startTask(task: TaskContent): { nodeId: string; text: string; options: TaskOption[] } {
  const first = task.nodes[0];
  if (!first) throw new Error(`Задание ${task.id} без узлов`);
  return { nodeId: first.id, text: first.text, options: first.options ?? [] };
}

export function chooseOption(
  task: TaskContent,
  nodeId: string,
  optionIndex: number,
): TaskStepResult {
  const node = task.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Узел ${nodeId} не найден в задании ${task.id}`);
  const option = node.options?.[optionIndex];
  if (!option) throw new Error(`Вариант ${optionIndex} не найден в узле ${nodeId}`);
  const effects = [...(option.effect ? [option.effect] : []), ...(option.effects ?? [])];
  return {
    next: option.next,
    verdict: option.verdict,
    explanation: option.explanation,
    effects,
    spawnTask: option.spawnTask ?? null,
  };
}

const TOPIC_ORDER = { budget: 0, savings: 1, payments: 2 } as const;

/** Map pins: non-correction Задания without a parent, topic order then `order`. */
export function taskUnlockOrder(tasks: readonly TaskContent[]): TaskContent[] {
  return tasks
    .filter((t) => !t.correction && !t.parent)
    .slice()
    .sort((a, b) => TOPIC_ORDER[a.topic] - TOPIC_ORDER[b.topic] || (a.order ?? 0) - (b.order ?? 0));
}

/** Mini-games shown inside `parent`'s sheet, in file order. */
export function childGames(parent: TaskContent, tasks: readonly TaskContent[]): TaskContent[] {
  return tasks.filter((t) => t.parent === parent.id && !t.correction);
}

/** Everything a child can finish: pins that are ready plus their mini-games. */
export function playableTasks(tasks: readonly TaskContent[]): TaskContent[] {
  const pins = taskUnlockOrder(tasks).filter((t) => !t.comingSoon);
  return [...pins, ...pins.flatMap((pin) => childGames(pin, tasks))];
}

/**
 * The Задание that must be completed before `task` opens, or null if it is
 * open from the start. «Что такое бюджет?», «Что такое сбережения», and
 * «Планирование бюджета» are open at first. Finishing «Что такое бюджет?»
 * opens the first Урок of every topic that is still closed; after that each
 * topic goes in order.
 */
export function missionPrerequisite(task: TaskContent, tasks: readonly TaskContent[]): TaskContent | null {
  if (task.correction) return null;
  if (task.parent) return tasks.find((t) => t.id === task.parent) ?? null;
  if (task.id === FEATURES.savingsTaskId || task.id === FEATURES.planTaskId) return null;
  const ordered = taskUnlockOrder(tasks);
  if (task.requires) return ordered.find((t) => t.id === task.requires) ?? null;
  const order = task.order ?? 1;
  if (order > 1) {
    return ordered.find((t) => t.topic === task.topic && (t.order ?? 1) === order - 1) ?? null;
  }
  if (task.topic === "budget") return null;
  return ordered.find((t) => t.topic === "budget" && (t.order ?? 1) === 1) ?? null;
}

/** A pinned Урок (not a mini-game, correction, or «скоро» pin) ends the Игровой день on its first completion. */
export function endsGameDay(
  task: Pick<TaskContent, "pin" | "correction" | "parent" | "comingSoon">,
): boolean {
  return task.pin != null && !task.correction && !task.parent && !task.comingSoon;
}

/**
 * Open missions: those whose prerequisite is completed. The same chain in
 * normal play and Демо-режим. The Игровой день never locks a pin.
 */
export function unlockedTasks(
  tasks: readonly TaskContent[],
  completedIds: ReadonlySet<string>,
): TaskContent[] {
  return playableTasks(tasks).filter((task) => {
    const before = missionPrerequisite(task, tasks);
    return before === null || completedIds.has(before.id);
  });
}

/** Points for the first answer to a question: right 1, «с ценой» ½, wrong 0. */
export function verdictPoints(verdict: Verdict): number {
  if (verdict === "good") return 1;
  if (verdict === "warn") return 0.5;
  return 0;
}

/**
 * Scored answers in a Задание: one per choice node, one per sort item. Card
 * nodes teach and the planning/saving games (allocate, compare, replan,
 * steps, dream) show consequences instead of right/wrong — not counted.
 */
export function scoredUnits(task: TaskContent): number {
  return task.nodes.reduce((sum, node) => {
    const kind = node.kind ?? "choice";
    if (kind === "choice") return sum + 1;
    if (kind === "sort") return sum + (node.items?.length ?? 0);
    return sum;
  }, 0);
}

/**
 * Coins a run earns: the mission's max (`reward`) × share of points from
 * first answers. Rounded, never above the max.
 */
export function earnedReward(task: TaskContent, firstVerdicts: readonly Verdict[]): number {
  const total = scoredUnits(task);
  if (total === 0) return task.reward;
  const points = firstVerdicts.reduce((sum, verdict) => sum + verdictPoints(verdict), 0);
  return Math.min(task.reward, Math.round((task.reward * points) / total));
}

/** Sorting one item is right or wrong — no «с ценой» middle. */
export function sortVerdict(item: SortItem, chosenBin: number): Verdict {
  return item.bin === chosenBin ? "good" : "bad";
}

/**
 * Only the improvement over the best earlier run is paid, so replays cannot
 * farm coins but a better answer is still worth coming back for.
 */
export function rewardTopUp(bestSoFar: number, earned: number): number {
  return Math.max(0, earned - bestSoFar);
}

/** «Можно получить ещё N» on the map sheet. */
export function rewardLeft(task: TaskContent, bestSoFar: number): number {
  return Math.max(0, task.reward - bestSoFar);
}

/** Legacy +10-once rule, kept for correction Задания without a score. */
export function taskRewardDue(alreadyPaid: boolean): number {
  return alreadyPaid ? 0 : ECONOMY.taskReward;
}
