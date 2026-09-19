import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { META_KEYS } from "../../data/metaKeys";
import type { DaySummaryView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "DaySummary">;

function ScoreRow({ word, points, earned }: { word: string; points: number; earned: boolean }) {
  return (
    <View style={styles.row}>
      <Text
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.icon}
      >
        {earned ? strings.scoreYesIcon : strings.scoreNoIcon}
      </Text>
      <Text style={styles.body}>{strings.scoreFact(word, points)}</Text>
    </View>
  );
}

function meterReason(summary: DaySummaryView): { care: string; mood: string } {
  return {
    care: summary.meterDeltas.care < 0 ? strings.meterReasonCareSkip : strings.meterReasonUnchanged(strings.care),
    mood:
      summary.meterDeltas.mood < 0
        ? strings.meterReasonMoodOverspend
        : strings.meterReasonUnchanged(strings.mood),
  };
}

export default function DaySummaryScreen({ navigation }: Props) {
  const { game, meta } = useSession();
  const profileId = meta.get(META_KEYS.activeProfileId);
  const summary = profileId ? game.lastClosedDay(profileId) : null;
  const profile = profileId ? game.getProfile(profileId) : null;

  if (!summary || !profile) {
    return (
      <Screen>
        <BackButton />
        <Text style={styles.title}>{strings.daySummaryTitle}</Text>
      </Screen>
    );
  }

  const reasons = meterReason(summary);
  const primary = profile.isDemo ? strings.nextDay : strings.waitTomorrow;

  return (
    <Screen footer={<PrimaryButton label={primary} onPress={() => navigation.goBack()} />}>
      <BackButton />
      <Text style={styles.title}>{strings.daySummaryTitle}</Text>
      <PetView
        species={profile.species}
        color={profile.color}
        accessory={profile.accessory}
        petName={profile.petName}
        care={profile.care}
        mood={profile.mood}
        pose={summary.meterDeltas.care < 0 ? "sad" : undefined}
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
        <ScoreRow word={strings.scoreMandatory} points={summary.facts.mandatoryCovered ? 2 : 0} earned={summary.facts.mandatoryCovered} />
        <ScoreRow word={strings.scoreWithinPlan} points={summary.facts.withinPlan ? 1 : 0} earned={summary.facts.withinPlan} />
        <ScoreRow word={strings.scoreDeposit} points={summary.facts.deposited ? 1 : 0} earned={summary.facts.deposited} />
      </Card>
      <Card>
        <Text style={styles.body}>{reasons.care}</Text>
        <Text style={styles.body}>{reasons.mood}</Text>
      </Card>
      {summary.stageExplanation ? (
        <Card>
          <Text style={styles.section}>
            {strings.stageIcon} {strings.stageWord} {STAGE_NAMES[summary.stage]}
          </Text>
          <Text style={styles.body}>{summary.stageExplanation}</Text>
        </Card>
      ) : null}
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
  icon: {
    fontSize: type.section,
  },
});
