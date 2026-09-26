import type { TaskTopic } from "./tasks/model";
import { colors } from "./theme";

/** One fill per lesson topic: mission badge on Карта, lesson header in Словарик. */
export const TOPIC_TINT: Record<TaskTopic, string> = {
  budget: colors.badgeFill,
  savings: colors.fill,
  payments: colors.highlight,
};
