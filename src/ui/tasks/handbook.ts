import { taskUnlockOrder, type TaskContent, type TaskNode } from "../../core/tasks";

/**
 * A theory card the child can reread. Play-start prompts («Начать») and the
 * closing «Готово!» card are the lesson session, not the handbook.
 */
export function teachingCards(task: TaskContent): TaskNode[] {
  return task.nodes.filter(
    (node) => node.kind === "card" && node.title != null && node.title !== "Готово!" && node.button !== "Начать",
  );
}

/** Pinned Уроки the child has finished, in map order. Open-but-unfinished pins stay out. */
export function handbookLessons(
  tasks: readonly TaskContent[],
  completedIds: ReadonlySet<string>,
): TaskContent[] {
  return taskUnlockOrder(tasks).filter((task) => !task.comingSoon && completedIds.has(task.id));
}

export interface HandbookWord {
  id: string;
  title: string;
  text: string;
}

/** One Слова tile per theory card of the finished Уроки, in lesson order. */
export function handbookWords(lessons: readonly TaskContent[]): HandbookWord[] {
  return lessons.flatMap((task) =>
    teachingCards(task).map((card) => ({
      id: `${task.id}:${card.id}`,
      title: card.title ?? card.text,
      text: card.text,
    })),
  );
}
