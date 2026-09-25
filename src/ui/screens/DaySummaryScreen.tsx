import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { META_KEYS } from "../../data/metaKeys";
import type { DaySummaryView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { GlyphLabel, Pictogram } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "DaySummary">;

function ScoreRow({ word, points, earned }: { word: string; points: number; earned: boolean }) {
  return (
    <View style={styles.row}>
      <Pictogram glyph={earned ? strings.scoreYesIcon : strings.scoreNoIcon} />
      <Text style={styles.body}>{strings.scoreFact(word, points)}</Text>
    </View>
  );
}

function meterReason(summary: DaySummaryView): { care: string; mood: string } {
  return {
    care:
      summary.meterDeltas.care < 0
        ? strings.meterReasonSkippedMandatory(summary.meterDeltas.care)
        : strings.meterReasonUnchanged(strings.care),
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
      <Screen header={<StatusStrip />}>
        <BackButton />
        <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
      </Screen>
    );
  }

  const reasons = meterReason(summary);
  const primary = profile.isDemo ? strings.nextDay : strings.waitTomorrow;

  return (
    <Screen header={<StatusStrip />} footer={<PrimaryButton label={primary} onPress={() => navigation.goBack()} />}>
      <BackButton />
      <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
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
          <GlyphLabel
            glyph={strings.stageIcon}
            label={`${strings.stageWord} ${STAGE_NAMES[summary.stage]}`}
            labelStyle={styles.section}
          />
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
});
