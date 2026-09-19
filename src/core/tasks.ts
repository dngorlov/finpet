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

export interface TaskNode {
  id: string;
  text: string;
  options: TaskOption[];
}

export interface TaskContent {
  id: string;
  topic: "budget" | "savings" | "payments";
  title: string;
  reward: number;
  intro: string;
  /** Correction tasks are spawned by safe errors (R9); hidden from the topic list. */
  correction?: boolean;
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
  return { nodeId: first.id, text: first.text, options: first.options };
}

export function chooseOption(
  task: TaskContent,
  nodeId: string,
  optionIndex: number,
): TaskStepResult {
  const node = task.nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Узел ${nodeId} не найден в задании ${task.id}`);
  const option = node.options[optionIndex];
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

/** Unlock order in normal play (§2.3): sequential topics, one new task per day. */
export function taskUnlockOrder(tasks: readonly TaskContent[]): TaskContent[] {
  const topicOrder = { budget: 0, savings: 1, payments: 2 } as const;
  return tasks
    .filter((t) => !t.correction)
    .slice()
    .sort((a, b) => topicOrder[a.topic] - topicOrder[b.topic]);
}

/**
 * Unlock order in normal play: one new task per Игровой день, topics sequential.
 * Демо-режим opens all non-correction tasks from day 1 (§2.3).
 */
export function unlockedTasks(
  tasks: readonly TaskContent[],
  dayNumber: number,
  isDemo: boolean,
): TaskContent[] {
  const ordered = taskUnlockOrder(tasks);
  if (isDemo) return ordered;
  return ordered.slice(0, Math.max(0, dayNumber));
}

/** +10 only on the first correct completion; replays are practice (§2.1). */
export function taskRewardDue(alreadyPaid: boolean): number {
  return alreadyPaid ? 0 : ECONOMY.taskReward;
}
