import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { playableTasks } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type {
  DaySummaryView,
  JournalEntry,
  TaskProgressView,
} from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Progress">;
type Tab = "results" | "journal" | "glossary";

function journalLabel(
  entry: JournalEntry,
  itemName: (id: string | null) => string,
  taskTitle: (id: string) => string | undefined,
): string {
  if (entry.labelKey === "starting_grant") return strings.journalStartingGrant;
  if (entry.labelKey === "allowance") return strings.journalAllowance;
  if (entry.labelKey === "savings_in") return strings.journalSavingsIn;
  if (entry.labelKey === "savings_out") return strings.journalSavingsOut;
  if (entry.labelKey === "bank_in") return strings.journalBankIn;
  if (entry.labelKey === "bank_out") return strings.journalBankOut;
  if (entry.labelKey.startsWith("purchase:")) return strings.journalPurchase(itemName(entry.itemId));
  if (entry.labelKey === "task_scene") return strings.journalTaskScene;
  if (entry.labelKey.startsWith("task_reward:")) {
    const title = taskTitle(entry.labelKey.slice("task_reward:".length));
    return title ? strings.journalTaskReward(title) : strings.journalTaskScene;
  }
  return entry.labelKey;
}

function meterReasonLines(deltas: DaySummaryView["meterDeltas"]): string[] {
  const lines: string[] = [];
  if (deltas.care < 0) lines.push(strings.meterReasonSkippedMandatory(deltas.care));
  if (deltas.mood < 0) lines.push(strings.meterReasonOptionalOverspend(deltas.mood));
  if (lines.length === 0) lines.push(strings.meterReasonNoChange);
  return lines;
}

export default function ProgressScreen(_props: Props) {
  const { game, meta, content } = useSession();
  const tour = useHowToPlayTour();
  const [tab, setTab] = useState<Tab>("journal");
  const [rows, setRows] = useState<JournalEntry[]>([]);
  const [lastClosed, setLastClosed] = useState<DaySummaryView | null>(null);
  const [tasks, setTasks] = useState<TaskProgressView[]>([]);
  const [goalCount, setGoalCount] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      setRows(game.listJournal(profileId));
      setLastClosed(game.lastClosedDay(profileId));
      setTasks(game.listTaskProgress(profileId));
      setGoalCount(game.boughtAsActiveGoalCount(profileId));
    }, [game, meta]),
  );

  const groups = useMemo(() => {
    const map = new Map<number, JournalEntry[]>();
    for (const row of rows) {
      const list = map.get(row.dayN) ?? [];
      list.push(row);
      map.set(row.dayN, list);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [rows]);

  const itemName = (id: string | null) => content.catalog.find((item) => item.id === id)?.name ?? id ?? "";
  const journalAmount = (entry: JournalEntry) => {
    if (entry.kind === "purchase" && entry.amount === 0 && entry.itemId) {
      return -(content.catalog.find((item) => item.id === entry.itemId)?.price ?? 0);
    }
    return entry.amount;
  };
  const taskTitle = (id: string) => content.tasks.find((task) => task.id === id)?.title;
  const topicTasks = playableTasks(content.tasks);
  const completedTopics = tasks.filter((row) => {
    if (row.status !== "completed") return false;
    return topicTasks.some((task) => task.id === row.taskKey);
  }).length;
  const achievedGoals = goalCount;

  return (
    <Screen header={<StatusStrip />}>
      <BackButton />
      <Text style={styles.title}>{strings.navProgress}</Text>
      <View style={styles.tabs}>
        <Chip label={strings.tabResults} selected={tab === "results"} onPress={() => setTab("results")} />
        <Chip label={strings.tabJournal} selected={tab === "journal"} onPress={() => setTab("journal")} />
        <Chip label={strings.tabGlossary} selected={tab === "glossary"} onPress={() => setTab("glossary")} />
      </View>
      {tab === "results" ? (
        lastClosed ? (
          <>
            <Card>
              <Text style={styles.section}>{strings.resultsLastDay(lastClosed.n)}</Text>
              <Text style={styles.body}>{strings.resultsScore(lastClosed.score)}</Text>
              <FactLine icon={strings.careIcon} label={strings.resultsScoreMandatory(lastClosed.facts.mandatoryCovered)} />
              <FactLine icon={strings.navPlanPictogram} label={strings.resultsScoreWithinPlan(lastClosed.facts.withinPlan)} />
              <FactLine icon={strings.savingsIcon} label={strings.scoreDeposited(lastClosed.facts.deposited)} />
              <BucketLine
                pictogram={strings.navPlanPictogram}
                label={strings.bucketMandatory}
                plan={lastClosed.plan.mandatory}
                actual={lastClosed.actual.mandatory}
              />
              <BucketLine
                pictogram={strings.navShopPictogram}
                label={strings.bucketOptional}
                plan={lastClosed.plan.optional}
                actual={lastClosed.actual.optional}
              />
              <BucketLine
                pictogram={strings.navSavingsPictogram}
                label={strings.bucketSavings}
                plan={lastClosed.plan.savings}
                actual={lastClosed.actual.savings}
              />
              {meterReasonLines(lastClosed.meterDeltas).map((line) => (
                <Text key={line} style={styles.body}>
                  {line}
                </Text>
              ))}
              <Badge icon={strings.stageIcon} word={strings.stageWord} value={STAGE_NAMES[lastClosed.stage]} />
              {lastClosed.stageExplanation ? (
                <Text style={styles.body}>{lastClosed.stageExplanation}</Text>
              ) : null}
            </Card>
            <Card>
              <Text style={styles.section}>{strings.resultsOverall}</Text>
              <Text style={styles.body}>{strings.resultsDaysPlayed(lastClosed.n)}</Text>
              <Text style={styles.body}>{strings.resultsTasksDone(completedTopics, topicTasks.length)}</Text>
              <Text style={styles.body}>{strings.resultsGoalsAchieved(achievedGoals)}</Text>
            </Card>
          </>
        ) : (
          <Card>
            <Text style={styles.body}>{strings.resultsEmpty}</Text>
          </Card>
        )
      ) : null}
      {tab === "journal"
        ? groups.map(([dayN, entries]) => (
            <Card key={dayN}>
              <Text style={styles.section}>{dayN === 0 ? strings.journalStart : strings.journalDay(dayN)}</Text>
              {entries.map((entry) => (
                <Text key={entry.id} style={styles.body}>
                  {journalLabel(entry, itemName, taskTitle)} {strings.journalAmount(journalAmount(entry))}
                </Text>
              ))}
            </Card>
          ))
        : null}
      {tab === "glossary" ? (
        <>
          <Card>
            <PrimaryButton label={strings.howToPlay} onPress={() => tour.start()} />
          </Card>
          {content.terms.map((term) => (
            <Card key={term.id}>
              <Pressable
                role="button"
                aria-label={term.term}
                aria-expanded={openId === term.id}
                onPress={() => setOpenId((current) => (current === term.id ? null : term.id))}
                style={styles.term}
              >
                <Text style={styles.termLabel}>{term.term}</Text>
              </Pressable>
              {openId === term.id ? <Text style={styles.body}>{term.definition}</Text> : null}
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

function FactLine({ icon, label }: { icon: string; label: string }) {
  return (
    <View accessible aria-label={label} style={styles.fact}>
      <Text
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.body}
      >
        {icon}
      </Text>
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

function BucketLine({
  pictogram,
  label,
  plan,
  actual,
}: {
  pictogram: string;
  label: string;
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
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  fact: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  term: {
    justifyContent: "center",
    minHeight: minTarget,
  },
  termLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
});
