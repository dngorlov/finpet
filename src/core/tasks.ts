import { ECONOMY } from "./config";
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

export interface TaskOption {
  label: string;
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
  /** Index into the node's `bins`. */
  bin: number;
  explanation: string;
}

export interface TaskNode {
  id: string;
  kind?: "choice" | "card" | "sort";
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
  /** Sort nodes: items shown one by one; each first answer is scored. */
  items?: SortItem[];
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
 * open from the start. Rule (map, 2026-09-24): only budget #1 is open at
 * first; finishing it opens #1 of every other topic and budget #2; after
 * that each topic goes strictly in order.
 */
export function missionPrerequisite(task: TaskContent, tasks: readonly TaskContent[]): TaskContent | null {
  if (task.correction) return null;
  if (task.parent) return tasks.find((t) => t.id === task.parent) ?? null;
  const ordered = taskUnlockOrder(tasks);
  if (task.requires) return ordered.find((t) => t.id === task.requires) ?? null;
  const order = task.order ?? 1;
  if (order > 1) {
    return ordered.find((t) => t.topic === task.topic && (t.order ?? 1) === order - 1) ?? null;
  }
  if (task.topic === "budget") return null;
  return ordered.find((t) => t.topic === "budget" && (t.order ?? 1) === 1) ?? null;
}

/**
 * Open missions: those whose prerequisite is completed. Демо-режим opens all
 * of them at once so a juror is never gated (§2.3, R13). No calendar gate.
 */
export function unlockedTasks(
  tasks: readonly TaskContent[],
  completedIds: ReadonlySet<string>,
  isDemo: boolean,
): TaskContent[] {
  const playable = playableTasks(tasks);
  if (isDemo) return playable;
  return playable.filter((task) => {
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
 * nodes teach and are not counted.
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
