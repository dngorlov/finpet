import { useCallback } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import { EarnedAchievements } from "../components/AchievementBoard";
import { BackButton } from "../components/BackButton";
import { CHART_COLORS } from "../components/DonutChart";
import { ScreenTitle } from "../components/ScreenTitle";
import { PixelIcon } from "../components/Pictogram";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { RootStackParamList } from "../navigation/types";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { moneyStrings } from "../stringsMoney";
import { colors, font, radius, spacing, type } from "../theme";
import { Amount, moneyColors, SectionTitle } from "./moneyParts";
import { OpenedToolCard, openedToolOnDay, type OpenedTool } from "./openedTool";
import { FactNote, MeterRow, PlanFactCard } from "./planFact";

type Props = NativeStackScreenProps<RootStackParamList, "DaySummary">;

export default function DaySummaryScreen({ navigation, route }: Props) {
  const { game, meta } = useSession();
  const { setTab } = usePlayChrome();
  const profileId = meta.get(META_KEYS.activeProfileId);
  const profile = profileId ? game.getProfile(profileId) : null;
  const summary = profileId ? game.lastClosedDay(profileId) : null;
  const openedFromDay =
    profileId && summary ? openedToolOnDay(game.listJournal(profileId), summary.n) : null;
  const openedTool: OpenedTool | null = profile?.isDemo ? null : (route.params?.openedTool ?? openedFromDay);

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

  if (!summary) {
    return (
      <Screen header={<StatusStrip />}>
        <BackButton />
        <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
      </Screen>
    );
  }

  const spent = summary.actual.mandatory + summary.actual.optional + summary.actual.savings;
  const planned = summary.plan.mandatory + summary.plan.optional + summary.plan.savings;

  return (
    <Screen header={<StatusStrip />} footer={<PrimaryButton label={strings.nextDay} onPress={beginNextDay} />}>
      <BackButton onPress={beginNextDay} />
      {openedTool ? <OpenedToolCard tool={openedTool} /> : null}
      <ScreenTitle style={styles.title}>{strings.daySummaryTitle}</ScreenTitle>
      <View style={styles.strip}>
        <View accessible aria-label={strings.dayAdvance(summary.n, summary.n + 1)} style={styles.advance}>
          <Text aria-hidden style={[styles.dayLabel, styles.dayDoneLabel]}>
            {strings.journalDay(summary.n)}
          </Text>
          <PixelIcon name="arrow-right" size={18} color={moneyColors.heroSubtle} />
          <View aria-hidden style={styles.dayNext}>
            <Text style={[styles.dayLabel, styles.dayNextLabel]}>{strings.journalDay(summary.n + 1)}</Text>
          </View>
        </View>
        <View style={styles.stats}>
          <View accessible aria-label={moneyStrings.statA11y(strings.daySummarySpent, spent)} style={styles.stat}>
            <Text aria-hidden style={styles.statLabel}>
              {strings.daySummarySpent}
            </Text>
            <Amount value={spent} size={14} color={moneyColors.heroText} />
          </View>
          <View accessible aria-label={moneyStrings.statA11y(strings.daySummaryPlanned, planned)} style={styles.stat}>
            <Text aria-hidden style={styles.statLabel}>
              {strings.daySummaryPlanned}
            </Text>
            <Amount value={planned} size={14} color={moneyColors.heroText} />
          </View>
        </View>
      </View>
      <SectionTitle>{strings.daySummaryPlan}</SectionTitle>
      <PlanFactCard plan={summary.plan} actual={summary.actual} />
      <MeterRow care={summary.meterDeltas.care} mood={summary.meterDeltas.mood} />
      {summary.meterDeltas.noPlan < 0 ? (
        <FactNote color={CHART_COLORS.mandatory} sprite="mood" text={strings.meterReasonNoPlan(summary.meterDeltas.noPlan)} />
      ) : null}
      {summary.facts.mandatoryCovered ? null : (
        <FactNote color={CHART_COLORS.mandatory} icon="clipboard" text={strings.nextDayPlanNeeds} />
      )}
      <EarnedAchievements dayN={summary.n} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  strip: {
    backgroundColor: moneyColors.heroFace,
    borderRadius: radius.card,
    gap: spacing.m,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.l,
  },
  advance: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
  },
  dayNext: {
    backgroundColor: colors.highlight,
    borderRadius: 10,
    justifyContent: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  dayLabel: {
    fontFamily: font.pixel,
    fontSize: 14,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 22,
  },
  dayDoneLabel: {
    color: moneyColors.heroText,
  },
  dayNextLabel: {
    color: colors.raisedEdge,
  },
  stats: {
    flexDirection: "row",
    gap: spacing.m,
    justifyContent: "space-between",
  },
  stat: {
    gap: 4,
  },
  statLabel: {
    color: moneyColors.heroSubtle,
    fontSize: 13,
    fontWeight: "700",
  },
});
