import { StyleSheet, Text, View } from "react-native";
import type { PlanBuckets } from "../../core/economy";
import { CoinText } from "../components/CoinText";
import { CHART_COLORS } from "../components/DonutChart";
import { PixelIcon } from "../components/Pictogram";
import { PixelSprite, type SpriteName } from "../components/PixelSprite";
import type { PixelIconName } from "../pixelIconXml";
import { strings } from "../strings";
import { colors, font, radius, spacing, type } from "../theme";
import { Amount, amountColor, MoneyCard, moneyColors, ProgressBar } from "./moneyParts";

type BucketKey = "mandatory" | "optional" | "savings";

const BUCKETS: readonly { key: BucketKey; label: string; color: string; icon: PixelIconName }[] = [
  { key: "mandatory", label: strings.bucketMandatory, color: CHART_COLORS.mandatory, icon: "clipboard" },
  { key: "optional", label: strings.bucketOptional, color: CHART_COLORS.optional, icon: "smile" },
  { key: "savings", label: strings.bucketSavings, color: CHART_COLORS.savings, icon: "arrow-down" },
];

function iconInk(color: string): string {
  if (color === CHART_COLORS.optional || color === CHART_COLORS.tasks) return colors.onRaised;
  return moneyColors.heroText;
}

/** Обязательные, Желаемые, and Копилка as one card: fact on the bar, plan under it. */
export function PlanFactCard({ plan, actual }: { plan: PlanBuckets; actual: PlanBuckets }) {
  const buckets = BUCKETS.map((bucket) => ({
    ...bucket,
    plan: plan[bucket.key],
    actual: actual[bucket.key],
  }));

  return (
    <MoneyCard>
      {buckets.map((bucket, index) => (
        <View key={bucket.key} style={[styles.compare, index === buckets.length - 1 ? null : styles.compareDivider]}>
          <View style={styles.compareTop}>
            <View style={[styles.mark, { backgroundColor: bucket.color }]}>
              <PixelIcon name={bucket.icon} size={18} color={iconInk(bucket.color)} />
            </View>
            <Text style={styles.compareLabel}>{bucket.label}</Text>
            <Amount value={bucket.actual} size={16} />
          </View>
          <ProgressBar value={bucket.actual} max={Math.max(bucket.plan, bucket.actual)} color={bucket.color} />
          <CoinText coin text={strings.planVsActual(bucket.plan, bucket.actual)} style={styles.planLine} />
        </View>
      ))}
    </MoneyCard>
  );
}

/** Сытость and Счастье for a closed day, the same pair as on Итоги дня. */
function MeterDeltaCard({
  sprite,
  label,
  delta,
  spoken,
}: {
  sprite: SpriteName;
  label: string;
  delta: number;
  spoken: string;
}) {
  const text = delta > 0 ? `+${delta}` : String(delta);
  return (
    <View accessible aria-label={spoken} style={styles.meterCard}>
      <View style={styles.meterHead}>
        <PixelSprite name={sprite} size={22} />
        <Text aria-hidden style={styles.meterLabel}>
          {label}
        </Text>
      </View>
      <Text aria-hidden style={[styles.meterValue, { color: amountColor(delta) }]}>
        {text}
      </Text>
    </View>
  );
}

export function MeterRow({ care, mood }: { care: number; mood: number }) {
  return (
    <View style={styles.meterRow}>
      <MeterDeltaCard sprite="food" label={strings.care} delta={care} spoken={strings.feedbackCare(care)} />
      <MeterDeltaCard sprite="mood" label={strings.mood} delta={mood} spoken={strings.feedbackMood(mood)} />
    </View>
  );
}

/** A short reason under the plan card. */
export function FactNote({
  color,
  icon,
  sprite,
  text,
}: {
  color: string;
  icon?: PixelIconName;
  sprite?: SpriteName;
  text: string;
}) {
  return (
    <View style={styles.note}>
      <View style={[styles.mark, { backgroundColor: color }]}>
        {sprite ? <PixelSprite name={sprite} size={18} /> : null}
        {icon ? <PixelIcon name={icon} size={18} color={iconInk(color)} /> : null}
      </View>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compare: {
    gap: spacing.s,
    paddingTop: spacing.s,
  },
  compareDivider: {
    borderBottomColor: colors.track,
    borderBottomWidth: 1,
    paddingBottom: spacing.s,
  },
  compareTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  compareLabel: {
    color: colors.text,
    flex: 1,
    fontSize: type.body,
    fontWeight: "700",
  },
  planLine: {
    color: colors.subtle,
    fontSize: type.body,
  },
  meterRow: {
    flexDirection: "row",
    gap: spacing.s,
  },
  meterCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flex: 1,
    gap: spacing.s,
    padding: spacing.m,
  },
  meterHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  meterLabel: {
    color: colors.text,
    flex: 1,
    fontSize: type.body,
    fontWeight: "700",
  },
  meterValue: {
    fontFamily: font.pixel,
    fontSize: 16,
    lineHeight: 24,
  },
  mark: {
    alignItems: "center",
    borderRadius: 16,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  note: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.s,
    padding: spacing.s,
  },
  body: {
    color: colors.text,
    flex: 1,
    fontSize: type.body,
  },
});
