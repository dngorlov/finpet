import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  allocationStatus,
  BUDGET_BUCKETS,
  planAfterEvent,
  replanPaidBy,
  splitSum,
  stealFromJar,
} from "../../core/budgetGames";
import { jarIsWorried, otherJars, type ShopPose } from "../../core/shopPlay";
import type { BudgetBucket, BudgetSplit } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { CHART_COLORS } from "../components/DonutChart";
import { colors, font, minTarget, radius, spacing, type } from "../theme";
import { BUCKET_COPY, gameStrings } from "./gameStrings";
import { gameStyles, InfoBanner } from "./GameParts";

const STEP = 5;
export const BUCKET_COLOR: Record<BudgetBucket, string> = {
  mandatory: CHART_COLORS.mandatory,
  wants: CHART_COLORS.optional,
  savings: CHART_COLORS.savings,
};

const EMPTY: BudgetSplit = { mandatory: 0, wants: 0, savings: 0 };

/** One colored bar split into buckets — the plan at a glance. */
export function SplitBar({ split, total }: { split: BudgetSplit; total: number }) {
  const base = Math.max(total, splitSum(split));
  return (
    <View aria-hidden style={styles.bar}>
      {BUDGET_BUCKETS.map((bucket) =>
        split[bucket] > 0 ? (
          <View key={bucket} style={{ backgroundColor: BUCKET_COLOR[bucket], flex: split[bucket] / base }} />
        ) : null,
      )}
      {splitSum(split) < total ? <View style={{ flex: (total - splitSum(split)) / base }} /> : null}
    </View>
  );
}

function BucketRow({
  bucket,
  value,
  onChange,
  locked,
}: {
  bucket: BudgetBucket;
  value: number;
  onChange: (next: number) => void;
  locked?: boolean;
}) {
  const copy = BUCKET_COPY[bucket];
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: BUCKET_COLOR[bucket] }]} />
      <Text aria-hidden style={styles.rowIcon}>
        {copy.icon}
      </Text>
      <View style={styles.rowText}>
        <Text style={gameStyles.body}>{copy.label}</Text>
        {locked ? <Text style={styles.lockedNote}>🔒 {gameStrings.locked}</Text> : null}
      </View>
      {locked ? null : (
        <StepButton label={gameStrings.less(copy.label)} glyph="−" disabled={value <= 0} onPress={() => onChange(Math.max(0, value - STEP))} />
      )}
      <Text accessible aria-label={`${copy.label}: ${value}`} style={styles.value}>
        {value}
      </Text>
      {locked ? null : (
        <StepButton label={gameStrings.more(copy.label)} glyph="+" onPress={() => onChange(value + STEP)} />
      )}
    </View>
  );
}

function StepButton({ label, glyph, onPress, disabled }: { label: string; glyph: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.step, disabled ? styles.stepOff : null, pressed && !disabled ? styles.stepPressed : null]}
    >
      <View style={[styles.stepFace, disabled ? styles.stepFaceOff : null]}>
        <Text aria-hidden style={styles.stepGlyph}>
          {glyph}
        </Text>
      </View>
    </Pressable>
  );
}

function Jar({
  bucket,
  value,
  total,
  worried,
  onPour,
  onSteal,
  stealAmount,
}: {
  bucket: BudgetBucket;
  value: number;
  total: number;
  worried: boolean;
  onPour?: () => void;
  onSteal?: () => void;
  stealAmount?: number;
}) {
  const copy = BUCKET_COPY[bucket];
  const pct = total > 0 ? Math.max(8, Math.min(100, (value / total) * 100)) : 8;
  const action = onSteal ?? onPour;
  const actionLabel = onSteal && stealAmount != null ? gameStrings.jarSteal(copy.label, stealAmount) : onPour ? gameStrings.jarPour(copy.label) : undefined;
  const body = (
    <View style={[styles.jar, worried ? styles.jarWorried : null]}>
      <View style={styles.jarGlass}>
        <View style={[styles.jarFill, { height: `${value > 0 ? pct : 0}%`, backgroundColor: BUCKET_COLOR[bucket] }]} />
      </View>
      <Text aria-hidden style={styles.jarIcon}>
        {copy.icon}
      </Text>
      <Text aria-hidden style={styles.jarValue}>
        {value}
      </Text>
    </View>
  );
  return (
    <View style={styles.jarCol}>
      {action && actionLabel ? (
        <Pressable role="button" aria-label={actionLabel} onPress={action}>
          {body}
        </Pressable>
      ) : (
        body
      )}
      {worried ? <Text style={styles.worried}>{gameStrings.jarWorried(copy.label)}</Text> : null}
    </View>
  );
}

function JarRow({
  split,
  total,
  onPour,
  steal,
  locked,
}: {
  split: BudgetSplit;
  total: number;
  onPour?: (bucket: BudgetBucket) => void;
  steal?: { amount: number; onSteal: (bucket: BudgetBucket) => void };
  locked?: BudgetBucket;
}) {
  return (
    <View style={styles.jars}>
      {BUDGET_BUCKETS.map((bucket) => (
        <Jar
          key={bucket}
          bucket={bucket}
          value={split[bucket]}
          total={total}
          worried={jarIsWorried(split[bucket], otherJars(split, bucket))}
          onPour={onPour ? () => onPour(bucket) : undefined}
          onSteal={steal && bucket !== locked && split[bucket] >= steal.amount ? () => steal.onSteal(bucket) : undefined}
          stealAmount={steal?.amount}
        />
      ))}
    </View>
  );
}

function StatusLine({ split, total }: { split: BudgetSplit; total: number }) {
  const status = allocationStatus(split, total);
  return (
    <View style={styles.status}>
      <Text style={gameStyles.pixel}>{gameStrings.allocated(splitSum(split), total)}</Text>
      <SplitBar split={split} total={total} />
      {status.kind === "short" ? (
        <Text style={gameStyles.body}>{gameStrings.allocLeft(status.left)}</Text>
      ) : status.kind === "over" ? (
        <InfoBanner tone="warn" text={gameStrings.allocOver(total)} />
      ) : (
        <>
          <Text style={[gameStyles.body, styles.exact]}>{gameStrings.allocExact}</Text>
          <Text style={[gameStyles.body, styles.exact]}>{gameStrings.jarLids}</Text>
        </>
      )}
    </View>
  );
}

/** План и факт, step 1: split `total` into the three buckets, then confirm. */
export function AllocateBoard({
  total,
  onDone,
  onPose,
}: {
  total: number;
  onDone: (plan: BudgetSplit) => void;
  onPose?: (pose: ShopPose) => void;
}) {
  const [split, setSplit] = useState<BudgetSplit>(EMPTY);
  const [ready, setReady] = useState(false);
  const exact = allocationStatus(split, total).kind === "exact";
  const pour = (bucket: BudgetBucket) => {
    const next = { ...split, [bucket]: split[bucket] + STEP };
    setSplit(next);
    onPose?.(allocationStatus(next, total).kind === "exact" ? "happy" : "idle");
  };
  if (ready) {
    return (
      <View style={styles.root}>
        <InfoBanner tone="good" text={`${gameStrings.planReady} ${gameStrings.planReadyLine(split.mandatory, split.wants, split.savings)}`} />
        <SplitBar split={split} total={total} />
        <PrimaryButton label={gameStrings.planDone} onPress={() => onDone(split)} />
      </View>
    );
  }
  return (
    <View style={styles.root}>
      <StatusLine split={split} total={total} />
      <JarRow split={split} total={total} onPour={pour} />
      <View style={gameStyles.panel}>
        {BUDGET_BUCKETS.map((bucket) => (
          <BucketRow
            key={bucket}
            bucket={bucket}
            value={split[bucket]}
            onChange={(v) => {
              const next = { ...split, [bucket]: v };
              setSplit(next);
              onPose?.(allocationStatus(next, total).kind === "exact" ? "happy" : "idle");
            }}
          />
        ))}
      </View>
      <PrimaryButton label={gameStrings.confirm} disabled={!exact} onPress={() => setReady(true)} />
    </View>
  );
}

/**
 * Пересобери план: the surprise already grew one bucket (locked); the child
 * trims the others until the plan fits again. No single right answer — the
 * line after confirm says what the choice costs.
 */
export function ReplanBoard({
  total,
  plan,
  event,
  outcomes,
  withPet,
  onDone,
  onPose,
}: {
  total: number;
  plan: BudgetSplit;
  event: { bucket: BudgetBucket; delta: number };
  outcomes?: Partial<Record<BudgetBucket, string>>;
  withPet: (text: string) => string;
  onDone: () => void;
  onPose?: (pose: ShopPose) => void;
}) {
  const bumped = planAfterEvent(plan, event);
  const [split, setSplit] = useState<BudgetSplit>(bumped);
  const [outcome, setOutcome] = useState<string | null>(null);
  const exact = allocationStatus(split, total).kind === "exact";

  if (outcome !== null) {
    return (
      <View style={styles.root}>
        <InfoBanner tone="good" text={`${gameStrings.replanReady} ${outcome}`} />
        <SplitBar split={split} total={total} />
        <Text style={gameStyles.body}>{gameStrings.planReadyLine(split.mandatory, split.wants, split.savings)}</Text>
        <PrimaryButton label={gameStrings.planDone} onPress={onDone} />
      </View>
    );
  }
  return (
    <View style={styles.root}>
      <View style={styles.oldPlan}>
        <Text style={styles.oldPlanLabel}>{gameStrings.plan}:</Text>
        {BUDGET_BUCKETS.map((bucket) => (
          <Text key={bucket} style={styles.oldPlanLabel}>
            {BUCKET_COPY[bucket].icon} {plan[bucket]}
          </Text>
        ))}
      </View>
      {splitSum(split) > total ? <InfoBanner tone="warn" text={gameStrings.replanNeed(splitSum(split), total)} /> : null}
      <Text style={gameStyles.body}>{gameStrings.replanSteal}</Text>
      <JarRow
        split={split}
        total={Math.max(total, splitSum(split))}
        locked={event.bucket}
        steal={{
          amount: event.delta,
          onSteal: (bucket) => {
            const next = stealFromJar(split, bucket, event.delta);
            if (!next) return;
            setSplit(next);
            onPose?.(allocationStatus(next, total).kind === "exact" ? "happy" : "sad");
          },
        }}
      />
      <StatusLine split={split} total={total} />
      <View style={gameStyles.panel}>
        {BUDGET_BUCKETS.map((bucket) => (
          <BucketRow
            key={bucket}
            bucket={bucket}
            value={split[bucket]}
            locked={bucket === event.bucket}
            onChange={(v) => setSplit((s) => ({ ...s, [bucket]: v }))}
          />
        ))}
      </View>
      <PrimaryButton
        label={gameStrings.confirm}
        disabled={!exact}
        onPress={() => {
          const paidBy = replanPaidBy(bumped, split, event.bucket) ?? replanPaidBy(plan, split, event.bucket);
          const line = paidBy ? outcomes?.[paidBy] : undefined;
          setOutcome(withPet(line ?? gameStrings.replanNothingCut));
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
  },
  status: {
    gap: spacing.s,
  },
  exact: {
    color: "#6B7A00",
    fontWeight: "700",
  },
  bar: {
    backgroundColor: colors.track,
    borderRadius: 10,
    flexDirection: "row",
    height: 20,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    minHeight: minTarget + 8,
  },
  dot: {
    borderRadius: 4,
    height: 32,
    width: 8,
  },
  rowIcon: {
    fontSize: 24,
  },
  rowText: {
    flex: 1,
  },
  lockedNote: {
    color: colors.subtle,
    fontSize: 13,
  },
  value: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
    minWidth: 44,
    textAlign: "center",
  },
  step: {
    backgroundColor: colors.raisedEdge,
    borderRadius: 12,
    height: minTarget,
    paddingBottom: 4,
    width: minTarget,
  },
  stepOff: {
    backgroundColor: colors.disabledFace,
  },
  stepPressed: {
    paddingBottom: 0,
    paddingTop: 4,
  },
  stepFace: {
    alignItems: "center",
    backgroundColor: colors.raisedFace,
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
  },
  stepFaceOff: {
    backgroundColor: colors.disabledFace,
  },
  stepGlyph: {
    color: colors.onRaised,
    fontSize: 24,
    fontWeight: "800",
  },
  oldPlan: {
    alignItems: "center",
    backgroundColor: colors.track,
    borderRadius: radius.card,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.m,
    padding: spacing.s,
  },
  oldPlanLabel: {
    color: colors.subtle,
    fontSize: type.body,
  },
  jars: {
    flexDirection: "row",
    gap: spacing.s,
  },
  jarCol: {
    flex: 1,
    gap: 4,
  },
  jar: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 18,
    borderWidth: 3,
    gap: 2,
    minHeight: 96,
    padding: spacing.s,
  },
  jarWorried: {
    borderColor: "#BA1A1A",
  },
  jarGlass: {
    backgroundColor: colors.track,
    borderRadius: 8,
    height: 48,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: "100%",
  },
  jarFill: {
    width: "100%",
  },
  jarIcon: {
    fontSize: 20,
  },
  jarValue: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 14,
  },
  worried: {
    color: "#BA1A1A",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
});
