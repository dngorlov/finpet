import { useCallback } from "react";
import { BackHandler, StyleSheet, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import type { DaySummaryView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { dayCloseLines, strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "DaySummary">;

function meterReason(summary: DaySummaryView): string[] {
  return dayCloseLines(summary.meterDeltas, true);
}

export default function DaySummaryScreen({ navigation }: Props) {
  const { game, meta } = useSession();
  const { setTab } = usePlayChrome();
  const profileId = meta.get(META_KEYS.activeProfileId);
  const summary = profileId ? game.lastClosedDay(profileId) : null;
  const profile = profileId ? game.getProfile(profileId) : null;

  if (!summary || !profile) {
    return (
      <Screen header={<StatusStrip />}>
        <BackButton />
        <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
      </Screen>
    );
  }

  const reasons = meterReason(summary);
  const beginNextDay = useCallback(() => {
    setTab("home");
    if (navigation.canGoBack()) {
      navigation.popTo("Main");
      return;
    }
    navigation.navigate("Main");
  }, [navigation, setTab]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        beginNextDay();
        return true;
      });
      return () => subscription.remove();
    }, [beginNextDay]),
  );

  return (
    <Screen header={<StatusStrip />} footer={<PrimaryButton label={strings.nextDay} onPress={beginNextDay} />}>
      <BackButton onPress={beginNextDay} />
      <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
      <PetView
        species={profile.species}
        color={profile.color}
        accessory={profile.accessory}
        petName={profile.petName}
        care={profile.care}
        mood={profile.mood}
        pose={summary.meterDeltas.care < 0 || summary.meterDeltas.mood < 0 ? "sad" : undefined}
      />
      <Card>
        <Text style={styles.section}>{strings.bucketMandatory}</Text>
        <Text style={styles.body}>{strings.planVsActual(summary.plan.mandatory, summary.actual.mandatory)}</Text>
        <Text style={styles.section}>{strings.bucketOptional}</Text>
        <Text style={styles.body}>{strings.planVsActual(summary.plan.optional, summary.actual.optional)}</Text>
        <Text style={styles.section}>{strings.bucketSavings}</Text>
        <Text style={styles.body}>{strings.planVsActual(summary.plan.savings, summary.actual.savings)}</Text>
      </Card>
      <Card>
        {reasons.map((line) => (
          <Text key={line} style={styles.body}>
            {line}
          </Text>
        ))}
      </Card>
      {summary.facts.mandatoryCovered ? null : <Text style={styles.body}>{strings.nextDayPlanNeeds}</Text>}
    </Screen>
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
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
});
