import { z } from "zod";
import catalogJson from "../../assets/content/catalog.json";
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
  once: z.boolean().optional().default(false),
});

const dayBillsSchema = z.object({
  items: z.array(z.string().min(1)).min(1),
  note: z.string().min(1).optional(),
});

const catalogFileSchema = z
  .object({
    contentVersion: z.literal(CONTENT_VERSION),
    items: z.array(catalogItemSchema).length(11),
    /** Счета cycle: day n uses bills[(n - 1) % length]. */
    bills: z.array(dayBillsSchema).min(1),
  })
  .superRefine((file, ctx) => {
    const mandatory = new Set(file.items.filter((item) => item.kind === "mandatory").map((item) => item.id));
    file.bills.forEach((day, dayIndex) => {
      day.items.forEach((id, itemIndex) => {
        if (!mandatory.has(id)) {
          ctx.addIssue({
            code: "custom",
            path: ["bills", dayIndex, "items", itemIndex],
            message: `Счёт «${id}» должен быть обязательным товаром каталога`,
          });
        }
      });
    });
  });

const goalSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  cost: z.number().int().positive(),
  description: z.string().min(1),
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

const sortItemSchema = z.object({
  label: z.string().min(1),
  bin: z.number().int().nonnegative(),
  explanation: z.string().min(1),
});

/** choice (default) asks; card teaches; sort is the «Нужно или хочется?» style mini-game. */
const taskNodeSchema = z
  .object({
    id: z.string().min(1),
    kind: z.enum(["choice", "card", "sort"]).optional(),
    title: z.string().min(1).optional(),
    text: z.string().min(1),
    options: z.array(taskOptionSchema).min(1).optional(),
    next: z.string().min(1).optional(),
    button: z.string().min(1).optional(),
    bins: z.array(z.string().min(1)).min(2).optional(),
    items: z.array(sortItemSchema).min(1).optional(),
  })
  .superRefine((node, ctx) => {
    const kind = node.kind ?? "choice";
    if (kind === "choice" && !node.options) {
      ctx.addIssue({ code: "custom", message: `Узел ${node.id}: у вопроса нет вариантов` });
    }
    if (kind !== "choice" && !node.next) {
      ctx.addIssue({ code: "custom", message: `Узел ${node.id}: нет next` });
    }
    if (kind === "sort") {
      const bins = node.bins?.length ?? 0;
      if (bins < 2 || !node.items) {
        ctx.addIssue({ code: "custom", message: `Узел ${node.id}: игре-сортировке нужны корзины и предметы` });
      }
      node.items?.forEach((item) => {
        if (item.bin >= bins) ctx.addIssue({ code: "custom", message: `Узел ${node.id}: «${item.label}» в несуществующей корзине` });
      });
    }
  });

const pinSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  district: z.string().min(1),
});

const taskSchema = z.object({
  id: z.string().min(1),
  topic: z.enum(["budget", "savings", "payments"]),
  title: z.string().min(1),
  reward: z.number().int().nonnegative(),
  intro: z.string().min(1),
  correction: z.boolean().optional(),
  order: z.number().int().positive().optional(),
  difficulty: z.number().int().min(1).max(3).optional(),
  description: z.string().min(1).optional(),
  pin: pinSchema.optional(),
  requires: z.string().min(1).optional(),
  parent: z.string().min(1).optional(),
  comingSoon: z.boolean().optional(),
  nodes: z.array(taskNodeSchema).min(1),
});

/**
 * Map missions need order + pin + description; correction tasks need none.
 * Every `next`, `spawnTask` and `requires` must point at something real.
 */
const tasksFileSchema = z
  .object({
    contentVersion: z.literal(CONTENT_VERSION),
    tasks: z.array(taskSchema).min(6),
  })
  .superRefine((file, ctx) => {
    const ids = new Set(file.tasks.map((task) => task.id));
    for (const task of file.tasks) {
      const onMap = !task.correction && !task.parent;
      if (onMap && (!task.order || !task.pin || !task.description || !task.difficulty)) {
        ctx.addIssue({ code: "custom", message: `Задание ${task.id}: на карте нужны order, pin, description, difficulty` });
      }
      if (task.parent && !ids.has(task.parent)) {
        ctx.addIssue({ code: "custom", message: `Задание ${task.id}: parent «${task.parent}» не найдено` });
      }
      if (task.requires && !ids.has(task.requires)) {
        ctx.addIssue({ code: "custom", message: `Задание ${task.id}: requires «${task.requires}» не найдено` });
      }
      const nodeIds = new Set(task.nodes.map((node) => node.id));
      const targetOk = (next: string) => next === "exit" || next === "retry" || nodeIds.has(next);
      for (const node of task.nodes) {
        if (node.next && !targetOk(node.next)) {
          ctx.addIssue({ code: "custom", message: `Задание ${task.id}: узел ${node.id} ведёт в «${node.next}»` });
        }
        for (const option of node.options ?? []) {
          if (!targetOk(option.next)) {
            ctx.addIssue({ code: "custom", message: `Задание ${task.id}: вариант «${option.label}» ведёт в «${option.next}»` });
          }
          if (option.spawnTask && !ids.has(option.spawnTask)) {
            ctx.addIssue({ code: "custom", message: `Задание ${task.id}: spawnTask «${option.spawnTask}» не найдено` });
          }
        }
      }
    }
  });

export type CatalogItemContent = z.infer<typeof catalogItemSchema>;
export type DayBillsContent = z.infer<typeof dayBillsSchema>;
export type GoalContent = z.infer<typeof goalSchema>;
export type TermContent = z.infer<typeof termSchema>;
export type TaskFileContent = z.infer<typeof taskSchema>;

export interface GameContent {
  contentVersion: typeof CONTENT_VERSION;
  catalog: CatalogItemContent[];
  /** Счета cycle — which mandatory items are due on each Игровой день. */
  bills: DayBillsContent[];
  goals: GoalContent[];
  terms: TermContent[];
  tasks: TaskFileContent[];
}

/** Loads and validates catalog, terms, and tasks. Цели are derived from optional catalog rows. */
export function loadContent(): GameContent {
  const catalog = catalogFileSchema.parse(catalogJson);
  const terms = termsFileSchema.parse(termsJson);
  const tasks = tasksFileSchema.parse(tasksJson);

  return {
    contentVersion: CONTENT_VERSION,
    catalog: catalog.items,
    bills: catalog.bills,
    goals: catalog.items
      .filter((item) => item.kind === "optional")
      .map((item) => ({
        id: item.id,
        name: item.name,
        cost: item.price,
        description: item.description,
      })),
    terms: terms.terms,
    tasks: tasks.tasks,
  };
}
