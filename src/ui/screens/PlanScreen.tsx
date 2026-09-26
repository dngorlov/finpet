import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { planMandatoryFloor, validatePlan, type PlanBuckets } from "../../core/economy";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { CoinText } from "../components/CoinText";
import { CHART_COLORS, DonutChart } from "../components/DonutChart";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { moneyStrings } from "../stringsMoney";
import { colors, radius, spacing, type } from "../theme";
import { bucketSpendOnDay, itemLookup, percents } from "./journalStats";
import { Amount, HeroCard, Legend, MoneyCard, moneyColors, ProgressBar, type LegendRow } from "./moneyParts";
import { daysToGoalAt, incomeToday, todayBills, wantsThatFit } from "./planDraft";

const EMPTY: PlanBuckets = { mandatory: 0, optional: 0, savings: 0 };

export default function PlanScreen() {
  const { game, meta, content } = useSession();
  const { touchChrome, focus } = usePlayChrome();
  const [day, setDay] = useState<DayState | null>(null);
  const [buckets, setBuckets] = useState<PlanBuckets>(EMPTY);
  const [yesterday, setYesterday] = useState<PlanBuckets | null>(null);
  const [askingConfirm, setAskingConfirm] = useState(false);
  const [income, setIncome] = useState(0);
  const [goal, setGoal] = useState<{ name: string; remaining: number } | null>(null);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const next = game.dayState(profileId);
    setDay(next);
    const floor = planMandatoryFloor(todayBills(next.n, content.bills, content.catalog).total, next.available);
    // A fresh draft starts with today's Счета already in Обязательные.
    setBuckets(next.plan.status === "none" ? { ...EMPTY, mandatory: floor } : next.plan.buckets);
    const journal = game.listJournal(profileId);
    setIncome(incomeToday(journal, next.n));
    // Day 1 has no yesterday to compare with.
    setYesterday(
      next.n > 1 ? bucketSpendOnDay(journal, next.n - 1, itemLookup(content.catalog, content.goals)) : null,
    );
    const savings = game.savingsState(profileId);
    const active = savings.activeGoal;
    const name = active ? content.goals.find((entry) => entry.id === active.key)?.name : undefined;
    setGoal(active && name && !active.achieved ? { name, remaining: active.remaining } : null);
    setAskingConfirm(false);
    touchChrome();
  }, [game, meta, content, touchChrome]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!day) {
    return (
      <Screen>
        <CoinText text={strings.appName} style={styles.body} />
      </Screen>
    );
  }

  if (!day.open) {
    return (
      <Screen>
        <ScreenTitle style={styles.title}>{strings.navPlan}</ScreenTitle>
        <CoinText text={strings.waitingEconomyHint} style={styles.body} />
      </Screen>
    );
  }

  const confirmed = day.plan.status === "confirmed";
  const bills = todayBills(day.n, content.bills, content.catalog);
  const floor = planMandatoryFloor(bills.total, day.available);
  const billsShort = bills.total - floor;
  const check = validatePlan(buckets, day.available, floor);
  const goalDays = goal ? daysToGoalAt(goal.remaining, buckets.savings) : null;
  const persist = (next: PlanBuckets) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || confirmed) return;
    setBuckets(next);
    game.saveDraftPlan(profileId, day.dayId, next);
  };

  const askConfirm = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !check.ok || confirmed) return;
    game.saveDraftPlan(profileId, day.dayId, buckets);
    setAskingConfirm(true);
  };

  const confirm = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const result = game.confirmPlan(profileId, day.dayId, floor);
    if (!result.ok) {
      setAskingConfirm(false);
      load();
      return;
    }
    load();
  };

  const shown = confirmed ? day.plan.buckets : buckets;
  const free = Math.max(0, day.available - shown.mandatory - shown.optional - shown.savings);
  const sliceValues = [shown.mandatory, shown.savings, shown.optional, free];
  const shares = percents(sliceValues);
  const legend: LegendRow[] = [
    { id: "mandatory", label: strings.bucketMandatory, color: CHART_COLORS.mandatory, amount: shown.mandatory, percent: shares[0] },
    { id: "savings", label: strings.bucketSavings, color: CHART_COLORS.savings, amount: shown.savings, percent: shares[1] },
    { id: "optional", label: strings.bucketOptional, color: CHART_COLORS.optional, amount: shown.optional, percent: shares[2] },
    { id: "free", label: moneyStrings.planFree, color: moneyColors.free, amount: free, percent: shares[3] },
  ];
  const chartParts = legend.filter((row) => row.amount > 0);

  return (
    <Screen
      footer={
        confirmed ? null : askingConfirm ? (
          <>
            <TextButton label={strings.close} onPress={() => setAskingConfirm(false)} />
            <PrimaryButton highlighted={focus?.kind === "plan"} label={strings.confirmPlan} onPress={confirm} />
          </>
        ) : (
          <PrimaryButton highlighted={focus?.kind === "plan"} label={strings.confirmPlan} disabled={!check.ok} onPress={askConfirm} />
        )
      }
    >
      <ScreenTitle style={styles.title}>{strings.navPlan}</ScreenTitle>
      <HeroCard caption={moneyStrings.planCaption} value={day.available} label={strings.planAvailable(day.available)}>
        {confirmed || income <= 0 ? null : <Text style={styles.heroLine}>{strings.planIncomeToday(income)}</Text>}
      </HeroCard>
      {confirmed ? null : <CoinText text={strings.planPromise} style={styles.note} />}
      <MoneyCard>
        <Text style={styles.section}>{moneyStrings.planSplit}</Text>
        <View style={styles.split}>
          <DonutChart
            size={132}
            thickness={24}
            slices={legend.map((row) => ({ id: row.id, label: row.label, value: row.amount, color: row.color }))}
            centerValue={day.available}
            centerCaption={moneyStrings.planChartCenter}
            accessibilityLabel={moneyStrings.planChartA11y(chartParts)}
          />
        </View>
        <Legend rows={legend} />
      </MoneyCard>
      {confirmed || bills.parts.length === 0 ? null : (
        <Card>
          <CoinText text={strings.planBillsTitle} style={styles.section} />
          {bills.note ? <CoinText text={bills.note} style={styles.body} /> : null}
          <CoinText coin text={strings.planBillsLine(bills.parts, bills.total)} style={styles.body} />
          {billsShort > 0 ? <CoinText text={strings.planBillsShort(billsShort)} style={styles.body} /> : null}
        </Card>
      )}
      {confirmed ? (
        <>
          <BucketActual
            label={strings.bucketMandatory}
            color={CHART_COLORS.mandatory}
            plan={day.plan.buckets.mandatory}
            actual={day.actual.mandatory}
            yesterday={yesterday?.mandatory}
          />
          <BucketActual
            label={strings.bucketSavings}
            color={CHART_COLORS.savings}
            plan={day.plan.buckets.savings}
            actual={day.actual.savings}
            yesterday={yesterday?.savings}
          />
          <BucketActual
            label={strings.bucketOptional}
            color={CHART_COLORS.optional}
            plan={day.plan.buckets.optional}
            actual={day.actual.optional}
            yesterday={yesterday?.optional}
          />
        </>
      ) : (
        <>
          {/* Order = order of decisions: Счета → себе на Цель → желаемое на остаток. */}
          <DraftBucket
            label={strings.bucketMandatory}
            pictogram={strings.navPlanPictogram}
            color={CHART_COLORS.mandatory}
            value={buckets.mandatory}
            min={floor}
            max={day.available}
            yesterday={yesterday?.mandatory}
            extra={floor > 0 ? strings.planBillsFloor(floor) : undefined}
            onChange={(mandatory) => persist({ ...buckets, mandatory: Math.max(floor, mandatory) })}
          />
          <DraftBucket
            label={strings.bucketSavings}
            pictogram={strings.navSavingsPictogram}
            color={CHART_COLORS.savings}
            value={buckets.savings}
            max={day.available}
            yesterday={yesterday?.savings}
            extra={strings.planSavingsExtra}
            hint={
              goal
                ? goalDays == null
                  ? strings.planGoalNoSavings(goal.name)
                  : strings.planGoalForecast(goal.name, goalDays)
                : undefined
            }
            onChange={(savings) => persist({ ...buckets, savings })}
          />
          <DraftBucket
            label={strings.bucketOptional}
            pictogram={strings.navShopPictogram}
            color={CHART_COLORS.optional}
            value={buckets.optional}
            max={day.available}
            yesterday={yesterday?.optional}
            hint={strings.planWantsHint(wantsThatFit(content.catalog, buckets.optional))}
            onChange={(optional) => persist({ ...buckets, optional })}
          />
        </>
      )}
      {confirmed ? null : <CoinText coin text={strings.planRemainder(check.remainder)} style={styles.remainder} />}
      {confirmed || check.ok ? null : <CoinText text={strings.planOverBudget} style={styles.body} />}
      {askingConfirm ? (
        <Card>
          <CoinText text={strings.confirmPlanTitle} style={styles.section} />
          <CoinText text={strings.confirmPlanBody} style={styles.body} />
        </Card>
      ) : null}
    </Screen>
  );
}

function compareLine(today: number, yesterday: number): string {
  if (today > yesterday) return moneyStrings.planCompareMore(today - yesterday);
  if (today < yesterday) return moneyStrings.planCompareLess(yesterday - today);
  return moneyStrings.planCompareSame;
}

/** «Вчера: N» chip and how today's number compares; nothing on day 1. */
function Yesterday({ today, yesterday }: { today: number; yesterday?: number }) {
  if (yesterday == null) return null;
  return (
    <View style={styles.yesterday}>
      <View style={styles.yesterdayChip}>
        <Text style={styles.yesterdayText}>{moneyStrings.planYesterday(yesterday)}</Text>
      </View>
      <Text style={styles.compare}>{compareLine(today, yesterday)}</Text>
    </View>
  );
}

function BucketHeader({ label, color }: { label: string; color: string }) {
  return (
    <View style={styles.bucketHead}>
      <View style={[styles.bucketDot, { backgroundColor: color }]} />
      <Text style={styles.bucketLabel}>{label}</Text>
    </View>
  );
}

function DraftBucket({
  label,
  pictogram,
  color,
  value,
  max,
  yesterday,
  extra,
  hint,
  min,
  onChange,
}: {
  label: string;
  pictogram: string;
  color: string;
  value: number;
  max: number;
  yesterday?: number;
  extra?: string;
  hint?: string;
  min?: number;
  onChange: (next: number) => void;
}) {
  return (
    <View style={[styles.bucket, { borderLeftColor: color }]}>
      <AmountStepper
        label={label}
        pictogram={pictogram}
        value={value}
        min={min}
        max={max}
        showTrack
        onChange={onChange}
      />
      <Yesterday today={value} yesterday={yesterday} />
      {extra ? <CoinText coin={/\d/.test(extra)} text={extra} style={styles.small} /> : null}
      {hint ? <CoinText text={hint} style={styles.small} /> : null}
    </View>
  );
}

function BucketActual({
  label,
  color,
  plan,
  actual,
  yesterday,
}: {
  label: string;
  color: string;
  plan: number;
  actual: number;
  yesterday?: number;
}) {
  return (
    <View style={[styles.bucket, { borderLeftColor: color }]}>
      <View style={styles.bucketTop}>
        <BucketHeader label={label} color={color} />
        <Amount value={actual} size={14} />
      </View>
      <ProgressBar value={actual} max={plan} color={color} />
      <CoinText coin text={strings.planVsActual(plan, actual)} style={styles.small} />
      <Yesterday today={plan} yesterday={yesterday} />
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  note: {
    color: colors.subtle,
    fontSize: type.body,
  },
  small: {
    color: colors.subtle,
    fontSize: type.body,
  },
  remainder: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  heroLine: {
    color: moneyColors.heroSubtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  split: {
    alignItems: "center",
    paddingVertical: spacing.s,
  },
  bucket: {
    backgroundColor: colors.card,
    borderLeftWidth: 6,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.m,
  },
  bucketTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  bucketHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  bucketDot: {
    borderRadius: 6,
    height: 12,
    width: 12,
  },
  bucketLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  yesterday: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  yesterdayChip: {
    backgroundColor: colors.track,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  yesterdayText: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  compare: {
    color: colors.subtle,
    flexShrink: 1,
    fontSize: 14,
  },
});
