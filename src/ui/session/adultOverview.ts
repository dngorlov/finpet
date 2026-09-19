import type { GameContent } from "../../data/content";
import type { SessionGame } from "./types";
import { strings } from "../strings";
import { TASK_TOPICS, topicTaskGroups } from "../tasks/model";

export type AdultOverview = {
  daysLine: string;
  tasksLine: string;
  topics: string[];
};

const TOPIC_TITLE = {
  budget: () => strings.taskTopicBudget,
  savings: () => strings.taskTopicSavings,
  payments: () => strings.taskTopicPayments,
} as const;

export function adultOverview(game: SessionGame, content: GameContent, profileId: string): AdultOverview {
  const progress = game.listTaskProgress(profileId);
  const last = game.lastClosedDay(profileId);
  const groups = topicTaskGroups(content.tasks);
  const byKey = new Map(progress.map((row) => [row.taskKey, row]));
  const completed = (taskId: string) => byKey.get(taskId)?.status === "completed";
  const nonCorrection = content.tasks.filter((task) => !task.correction);
  return {
    daysLine: last ? strings.resultsDaysPlayed(last.n) : strings.adultDaysEmpty,
    tasksLine: strings.resultsTasksDone(
      nonCorrection.filter((task) => completed(task.id)).length,
      nonCorrection.length,
    ),
    topics: TASK_TOPICS.map((topic) =>
      strings.adultTopicLine(TOPIC_TITLE[topic](), groups[topic].filter((task) => completed(task.id)).length),
    ),
  };
}
