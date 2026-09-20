import { z } from "zod";
import catalogJson from "../../assets/content/catalog.json";
import goalsJson from "../../assets/content/goals.json";
import hintJson from "../../assets/content/hint.json";
import tasksJson from "../../assets/content/tasks.json";
import termsJson from "../../assets/content/terms.json";

const CONTENT_VERSION = 1;

const meterEffectSchema = z.object({
  meter: z.enum(["care", "mood"]),
  delta: z.number().int(),
});

const catalogItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(["mandatory", "optional"]),
  price: z.number().int().nonnegative(),
  effect: meterEffectSchema,
  description: z.string().min(1),
});

const catalogFileSchema = z.object({
  contentVersion: z.literal(CONTENT_VERSION),
  items: z.array(catalogItemSchema).min(8),
});

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().int().positive(),
  description: z.string().min(1),
});

const goalsFileSchema = z.object({
  contentVersion: z.literal(CONTENT_VERSION),
  goals: z.array(goalSchema).min(3),
});

const termSchema = z.object({
  id: z.string().min(1),
  term: z.string().min(1),
  definition: z.string().min(1),
});

const termsFileSchema = z.object({
  contentVersion: z.literal(CONTENT_VERSION),
  terms: z.array(termSchema).length(11),
});

const hintCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
});

const hintFileSchema = z.object({
  contentVersion: z.literal(CONTENT_VERSION),
  cards: z.array(hintCardSchema).length(7),
});

const taskEffectObjectSchema = z.object({
  meter: z.enum(["care", "mood"]).optional(),
  delta: z.number().int().optional(),
  coins: z.number().int().optional(),
});

const taskOptionSchema = z.object({
  label: z.string().min(1),
  next: z.string().min(1),
  verdict: z.enum(["good", "warn", "bad"]),
  explanation: z.string().min(1),
  effect: taskEffectObjectSchema.optional(),
  effects: z.array(taskEffectObjectSchema).optional(),
  spawnTask: z.string().nullable().optional(),
});

const taskNodeSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  options: z.array(taskOptionSchema).min(1),
});

const taskSchema = z.object({
  id: z.string().min(1),
  topic: z.enum(["budget", "savings", "payments"]),
  title: z.string().min(1),
  reward: z.number().int().nonnegative(),
  intro: z.string().min(1),
  correction: z.boolean().optional(),
  nodes: z.array(taskNodeSchema).min(1),
});

const tasksFileSchema = z.object({
  contentVersion: z.literal(CONTENT_VERSION),
  tasks: z.array(taskSchema).min(6),
});

export type CatalogItemContent = z.infer<typeof catalogItemSchema>;
export type GoalContent = z.infer<typeof goalSchema>;
export type TermContent = z.infer<typeof termSchema>;
export type HintCardContent = z.infer<typeof hintCardSchema>;
export type TaskFileContent = z.infer<typeof taskSchema>;

export interface GameContent {
  contentVersion: typeof CONTENT_VERSION;
  catalog: CatalogItemContent[];
  goals: GoalContent[];
  terms: TermContent[];
  hints: HintCardContent[];
  tasks: TaskFileContent[];
}

/** Loads and validates the five content files. A version mismatch or bad shape throws. */
export function loadContent(): GameContent {
  const catalog = catalogFileSchema.parse(catalogJson);
  const goals = goalsFileSchema.parse(goalsJson);
  const terms = termsFileSchema.parse(termsJson);
  const hints = hintFileSchema.parse(hintJson);
  const tasks = tasksFileSchema.parse(tasksJson);

  return {
    contentVersion: CONTENT_VERSION,
    catalog: catalog.items,
    goals: goals.goals,
    terms: terms.terms,
    hints: hints.cards,
    tasks: tasks.tasks,
  };
}
