import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { planMandatoryFloor, validatePlan, type PlanBuckets } from "../../core/economy";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, DaySummaryView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { TextButton } from "../components/TextButton";
import { TourAnchor } from "../howToPlay/TourAnchor";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";
import { daysToGoalAt, incomeToday, todayBills, wantsThatFit } from "./planDraft";

type Props = NativeStackScreenProps<RootStackParamList, "Plan">;

const EMPTY: PlanBuckets = { mandatory: 0, optional: 0, savings: 0 };

export default function PlanScreen(_props: Props) {
  const { game, meta, content } = useSession();
  const tour = useHowToPlayTour();
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
  }, [game, meta, content]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!day) {
    return (
      <Screen header={<StatusStrip />}>
        <BackButton />
        <Text style={styles.body}>{strings.appName}</Text>
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
    if (!profileId || confirmed || tour.active) return;
    setBuckets(next);
    game.saveDraftPlan(profileId, day.dayId, next);
  };

  const askConfirm = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !check.ok || confirmed) return;
    if (tour.active) {
      setAskingConfirm(true);
      return;
    }
    game.saveDraftPlan(profileId, day.dayId, buckets);
    setAskingConfirm(true);
  };

  const confirm = () => {
    if (tour.active) return;
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
      header={<StatusStrip />}
      footer={
        confirmed ? null : askingConfirm ? (
          <>
            <TextButton label={strings.close} onPress={() => setAskingConfirm(false)} />
            <PrimaryButton label={strings.confirmPlan} disabled={tour.active} onPress={confirm} />
          </>
        ) : (
          <PrimaryButton label={strings.confirmPlan} disabled={!check.ok || tour.active} onPress={askConfirm} />
        )
      }
    >
      {tour.active ? null : <BackButton />}
      <Text style={styles.title}>{strings.navPlan}</Text>
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
        <TourAnchor id="plan-buckets">
          <Card>
            <BucketActual label={strings.bucketMandatory} pictogram={strings.navPlanPictogram} plan={day.plan.buckets.mandatory} actual={day.actual.mandatory} />
            <BucketActual label={strings.bucketOptional} pictogram={strings.navShopPictogram} plan={day.plan.buckets.optional} actual={day.actual.optional} />
            <BucketActual label={strings.bucketSavings} pictogram={strings.navSavingsPictogram} plan={day.plan.buckets.savings} actual={day.actual.savings} />
          </Card>
        </TourAnchor>
      ) : (
        <TourAnchor id="plan-buckets">
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
        </TourAnchor>
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
      <Text style={styles.body}>
        {pictogram} {label}
      </Text>
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
