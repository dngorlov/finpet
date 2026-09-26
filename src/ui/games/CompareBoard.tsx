import { StyleSheet, Text, View } from "react-native";
import { BUDGET_BUCKETS, planFactDiff } from "../../core/budgetGames";
import type { BudgetSplit } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { strings } from "../strings";
import { colors, font, spacing } from "../theme";
import { BUCKET_COLOR } from "./BudgetBoard";
import { BUCKET_COPY, gameStrings } from "./gameStrings";
import { gameStyles, InfoBanner } from "./GameParts";

/** «Пора проверить план»: plan and fact bars side by side, then what changed and why. */
export function CompareBoard({ plan, fact, onDone }: { plan: BudgetSplit; fact: BudgetSplit; onDone: () => void }) {
  const diff = planFactDiff(plan, fact);
  const top = Math.max(1, ...BUDGET_BUCKETS.flatMap((b) => [plan[b], fact[b]]));
  return (
    <View style={styles.root}>
      <View style={gameStyles.panel}>
        {BUDGET_BUCKETS.map((bucket) => (
          <View
            key={bucket}
            accessible
            aria-label={gameStrings.compareA11y(BUCKET_COPY[bucket].label, plan[bucket], fact[bucket])}
            style={styles.group}
          >
            <Text style={styles.groupTitle}>
              {BUCKET_COPY[bucket].icon} {BUCKET_COPY[bucket].label}
            </Text>
            {(
              [
                [gameStrings.plan, plan[bucket], true],
                [gameStrings.fact, fact[bucket], false],
              ] as const
            ).map(([label, value, isPlan]) => (
              <View key={label} style={styles.barRow}>
                <Text style={styles.barLabel}>{label}</Text>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${(value / top) * 100}%`,
                        backgroundColor: BUCKET_COLOR[bucket],
                        opacity: isPlan ? 0.45 : 1,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{value}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
      {BUDGET_BUCKETS.map((bucket) => {
        const d = diff[bucket];
        return (
          <InfoBanner
            key={bucket}
            tone={d === 0 ? "good" : bucket === "savings" ? (d > 0 ? "good" : "warn") : d > 0 ? "warn" : "good"}
            text={d > 0 ? gameStrings.diffMore(bucket, d) : d < 0 ? gameStrings.diffLess(bucket, -d) : gameStrings.diffSame(bucket)}
          />
        );
      })}
      <PrimaryButton label={strings.next} onPress={onDone} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.s,
  },
  group: {
    gap: 4,
    paddingVertical: 4,
  },
  groupTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  barRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  barLabel: {
    color: colors.subtle,
    fontSize: 14,
    width: 44,
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: 8,
    flex: 1,
    height: 16,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 8,
    height: 16,
  },
  barValue: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 12,
    minWidth: 36,
    textAlign: "right",
  },
});
