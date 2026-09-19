import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { validatePlan, type PlanBuckets } from "../../core/economy";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Plan">;

const EMPTY: PlanBuckets = { mandatory: 0, optional: 0, savings: 0 };

export default function PlanScreen(_props: Props) {
  const { game, meta } = useSession();
  const [day, setDay] = useState<DayState | null>(null);
  const [buckets, setBuckets] = useState<PlanBuckets>(EMPTY);
  const [askingConfirm, setAskingConfirm] = useState(false);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const next = game.dayState(profileId);
    setDay(next);
    setBuckets(next.plan.buckets);
    setAskingConfirm(false);
  }, [game, meta]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  if (!day) {
    return (
      <Screen>
        <BackButton />
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  const confirmed = day.plan.status === "confirmed";
  const check = validatePlan(buckets, day.available);
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
    const result = game.confirmPlan(profileId, day.dayId);
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
      <BackButton />
      <Text style={styles.title}>{strings.navPlan}</Text>
      <Text style={styles.body}>{strings.planAvailable(day.available)}</Text>
      {confirmed ? (
        <Card>
          <BucketActual label={strings.bucketMandatory} pictogram={strings.navPlanPictogram} plan={day.plan.buckets.mandatory} actual={day.actual.mandatory} />
          <BucketActual label={strings.bucketOptional} pictogram={strings.navShopPictogram} plan={day.plan.buckets.optional} actual={day.actual.optional} />
          <BucketActual label={strings.bucketSavings} pictogram={strings.navSavingsPictogram} plan={day.plan.buckets.savings} actual={day.actual.savings} />
        </Card>
      ) : (
        <Card>
          <AmountStepper
            label={strings.bucketMandatory}
            pictogram={strings.navPlanPictogram}
            value={buckets.mandatory}
            onChange={(mandatory) => persist({ ...buckets, mandatory })}
          />
          <AmountStepper
            label={strings.bucketOptional}
            pictogram={strings.navShopPictogram}
            value={buckets.optional}
            onChange={(optional) => persist({ ...buckets, optional })}
          />
          <AmountStepper
            label={strings.bucketSavings}
            pictogram={strings.navSavingsPictogram}
            value={buckets.savings}
            onChange={(savings) => persist({ ...buckets, savings })}
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
