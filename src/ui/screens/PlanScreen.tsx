import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { planMandatoryFloor, validatePlan, type PlanBuckets } from "../../core/economy";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, DaySummaryView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { GlyphLabel } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";
import { daysToGoalAt, incomeToday, todayBills, wantsThatFit } from "./planDraft";

const EMPTY: PlanBuckets = { mandatory: 0, optional: 0, savings: 0 };

export default function PlanScreen() {
  const { game, meta, content } = useSession();
  const { touchChrome } = usePlayChrome();
  const [day, setDay] = useState<DayState | null>(null);
  const [buckets, setBuckets] = useState<PlanBuckets>(EMPTY);
  const [lastClosed, setLastClosed] = useState<DaySummaryView | null>(null);
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
    setLastClosed(game.lastClosedDay(profileId));
    setIncome(incomeToday(game.listJournal(profileId), next.n));
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
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  if (!day.open) {
    return (
      <Screen>
        <ScreenTitle style={styles.title}>{strings.navPlan}</ScreenTitle>
        <Text style={styles.body}>{strings.waitingEconomyHint}</Text>
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

  return (
    <Screen
      footer={
        confirmed ? null : askingConfirm ? (
          <>
            <TextButton label={strings.close} onPress={() => setAskingConfirm(false)} />
            <PrimaryButton label={strings.confirmPlan} onPress={confirm} />
          </>
        ) : (
          <PrimaryButton label={strings.confirmPlan} disabled={!check.ok} onPress={askConfirm} />
        )
      }
    >
      <ScreenTitle style={styles.title}>{strings.navPlan}</ScreenTitle>
      {confirmed || income <= 0 ? null : <Text style={styles.body}>{strings.planIncomeToday(income)}</Text>}
      <Text style={styles.body}>{strings.planAvailable(day.available)}</Text>
      {confirmed ? null : <Text style={styles.body}>{strings.planPromise}</Text>}
      {confirmed || bills.parts.length === 0 ? null : (
        <Card>
          <Text style={styles.section}>{strings.planBillsTitle}</Text>
          {bills.note ? <Text style={styles.body}>{bills.note}</Text> : null}
          <Text style={styles.body}>{strings.planBillsLine(bills.parts, bills.total)}</Text>
          {billsShort > 0 ? <Text style={styles.body}>{strings.planBillsShort(billsShort)}</Text> : null}
        </Card>
      )}
      {confirmed ? (
          <Card>
            <BucketActual label={strings.bucketMandatory} pictogram={strings.navPlanPictogram} plan={day.plan.buckets.mandatory} actual={day.actual.mandatory} />
            <BucketActual label={strings.bucketOptional} pictogram={strings.navShopPictogram} plan={day.plan.buckets.optional} actual={day.actual.optional} />
            <BucketActual label={strings.bucketSavings} pictogram={strings.navSavingsPictogram} plan={day.plan.buckets.savings} actual={day.actual.savings} />
          </Card>
      ) : (
          <Card>
            {/* Order = order of decisions: Счета → себе на Цель → желаемое на остаток. */}
            <DraftBucket
              label={strings.bucketMandatory}
              pictogram={strings.navPlanPictogram}
              value={buckets.mandatory}
              min={floor}
              max={day.available}
              yesterday={lastClosed?.actual.mandatory}
              extra={floor > 0 ? strings.planBillsFloor(floor) : undefined}
              onChange={(mandatory) => persist({ ...buckets, mandatory: Math.max(floor, mandatory) })}
            />
            <DraftBucket
              label={strings.bucketSavings}
              pictogram={strings.navSavingsPictogram}
              value={buckets.savings}
              max={day.available}
              yesterday={lastClosed?.actual.savings}
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
              value={buckets.optional}
              max={day.available}
              yesterday={lastClosed?.actual.optional}
              hint={strings.planWantsHint(wantsThatFit(content.catalog, buckets.optional))}
              onChange={(optional) => persist({ ...buckets, optional })}
            />
          </Card>
      )}
      {confirmed ? null : <Text style={styles.body}>{strings.planRemainder(check.remainder)}</Text>}
      {confirmed || check.ok ? null : <Text style={styles.body}>{strings.planOverBudget}</Text>}
      {askingConfirm ? (
        <Card>
          <Text style={styles.section}>{strings.confirmPlanTitle}</Text>
          <Text style={styles.body}>{strings.confirmPlanBody}</Text>
        </Card>
      ) : null}
    </Screen>
  );
}

function DraftBucket({
  label,
  pictogram,
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
  value: number;
  max: number;
  yesterday?: number;
  extra?: string;
  hint?: string;
  min?: number;
  onChange: (next: number) => void;
}) {
  return (
    <View>
      <AmountStepper
        label={label}
        pictogram={pictogram}
        value={value}
        min={min}
        max={max}
        showTrack
        onChange={onChange}
      />
      {yesterday == null ? null : <Text style={styles.body}>{strings.planYesterday(yesterday)}</Text>}
      {extra ? <Text style={styles.body}>{extra}</Text> : null}
      {hint ? <Text style={styles.body}>{hint}</Text> : null}
    </View>
  );
}

function BucketActual({
  label,
  pictogram,
  plan,
  actual,
}: {
  label: string;
  pictogram: string;
  plan: number;
  actual: number;
}) {
  return (
    <View>
      <GlyphLabel glyph={pictogram} label={label} labelStyle={styles.body} />
      <Text style={styles.body}>{strings.planVsActual(plan, actual)}</Text>
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
});
