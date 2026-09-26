import { StyleSheet, Text, View } from "react-native";
import { BANK, FEATURES } from "../../core/config";
import { Pictogram } from "../components/Pictogram";
import { strings } from "../strings";
import { colors, font, radius, spacing, type } from "../theme";

/** Копилка, План, or Банк — the money tools a lesson can open. */
export type OpenedTool = "savings" | "plan" | "bank";

const TOOL_TASK: Record<OpenedTool, string> = {
  savings: FEATURES.savingsTaskId,
  plan: FEATURES.planTaskId,
  bank: BANK.unlockTaskId,
};

/** The money tool this Задание opens, or null when finishing it opens nothing. */
export function openedToolForTask(taskId: string): OpenedTool | null {
  for (const tool of Object.keys(TOOL_TASK) as OpenedTool[]) {
    if (TOOL_TASK[tool] === taskId) return tool;
  }
  return null;
}

/** The tool whose first reward landed on this Игровой день, if one did. */
export function openedToolOnDay(
  entries: readonly { dayN: number; labelKey: string }[],
  dayN: number,
): OpenedTool | null {
  for (const entry of entries) {
    if (entry.dayN !== dayN || !entry.labelKey.startsWith("task_reward:")) continue;
    const tool = openedToolForTask(entry.labelKey.slice("task_reward:".length));
    if (tool) return tool;
  }
  return null;
}

const EDGE = 4;

/** Gold plaque: the tool name is the largest thing on the result. */
export function OpenedToolCard({ tool }: { tool: OpenedTool }) {
  const copy = strings.toolOpened[tool];
  return (
    <View accessible role="heading" aria-label={copy.spoken} style={styles.shell}>
      <View aria-hidden style={styles.face}>
        <View style={styles.kickerRow}>
          <Pictogram glyph={strings.savingsConfetti} size={28} color={colors.onRaised} />
          <Text style={styles.kicker}>{strings.toolOpenedKicker}</Text>
        </View>
        <Pictogram glyph={copy.glyph} size={48} color={colors.onRaised} />
        <Text style={styles.name}>{copy.name}</Text>
        <Text style={styles.where}>{copy.where}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.raisedEdge,
    borderRadius: radius.card,
    paddingBottom: EDGE,
  },
  face: {
    alignItems: "center",
    backgroundColor: colors.highlight,
    borderRadius: radius.card,
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.l,
  },
  kickerRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  kicker: {
    color: colors.onRaised,
    fontSize: type.section,
    fontWeight: "700",
  },
  name: {
    color: colors.onRaised,
    fontFamily: font.pixel,
    fontSize: 22,
    lineHeight: 34,
    textAlign: "center",
  },
  where: {
    color: colors.onRaised,
    fontSize: type.body,
    fontWeight: "700",
    textAlign: "center",
  },
});
