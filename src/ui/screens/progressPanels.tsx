import { useCallback, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { STAGE_NAMES } from "../../core/stages";
import { playableTasks } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { DaySummaryView, JournalEntry, TaskProgressView } from "../../data/repositories/gameRepository";
import { Badge } from "../components/Badge";
import { CoinText } from "../components/CoinText";
import { GlyphLabel } from "../components/Pictogram";
import { Card } from "../components/Card";
import { useSession } from "../session/SessionProvider";
import { dayCloseLines, strings } from "../strings";
import { CHART_COLORS, DonutChart } from "../components/DonutChart";
import type { PixelIconName } from "../pixelIconXml";
import { moneyStrings } from "../stringsMoney";
import { colors, font, spacing, type } from "../theme";
import {
  classify,
  groupByDay,
  itemLookup,
  journalStats,
  type JournalFlow,
  type JournalPeriod,
} from "./journalStats";
import {
  Legend,
  MoneyCard,
  moneyColors,
  OpRow,
  PillRow,
  SectionTitle,
  StatTile,
  TileRow,
  type LegendRow,
} from "./moneyParts";

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
  return dayCloseLines(deltas, false);
}

function useRecord() {
  const { game, meta, content } = useSession();
  const [rows, setRows] = useState<JournalEntry[]>([]);
  const [lastClosed, setLastClosed] = useState<DaySummaryView | null>(null);
  const [tasks, setTasks] = useState<TaskProgressView[]>([]);
  const [goalCount, setGoalCount] = useState(0);
  const [today, setToday] = useState(1);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      setRows(game.listJournal(profileId));
      setToday(game.dayState(profileId).n);
      setLastClosed(game.lastClosedDay(profileId));
      setTasks(game.listTaskProgress(profileId));
      setGoalCount(game.boughtAsActiveGoalCount(profileId));
    }, [game, meta]),
  );

  return { content, rows, lastClosed, tasks, goalCount, today };
}

const PERIODS: { id: JournalPeriod; label: string }[] = [
  { id: "today", label: moneyStrings.periodToday },
  { id: "yesterday", label: moneyStrings.periodYesterday },
  { id: "three", label: moneyStrings.periodThree },
  { id: "all", label: moneyStrings.periodAll },
];

const FLOWS: { id: JournalFlow; label: string }[] = [
  { id: "spend", label: moneyStrings.flowSpend },
  { id: "income", label: moneyStrings.flowIncome },
];

const CATEGORY: Record<JournalFlow, Record<string, { label: string; color: string; icon: PixelIconName }>> = {
  spend: {
    mandatory: { label: moneyStrings.catMandatory, color: CHART_COLORS.mandatory, icon: "shopping-cart" },
    optional: { label: moneyStrings.catOptional, color: CHART_COLORS.optional, icon: "smile" },
    goal: { label: moneyStrings.catGoal, color: moneyColors.goal, icon: "star" },
    savings: { label: moneyStrings.catSavings, color: CHART_COLORS.savings, icon: "arrow-down" },
    bank: { label: moneyStrings.catBank, color: CHART_COLORS.bank, icon: "lock" },
    other: { label: moneyStrings.catOther, color: CHART_COLORS.other, icon: "coins" },
  },
  income: {
    allowance: { label: moneyStrings.incAllowance, color: CHART_COLORS.allowance, icon: "sun" },
    tasks: { label: moneyStrings.incTasks, color: CHART_COLORS.tasks, icon: "map" },
    start: { label: moneyStrings.incStart, color: CHART_COLORS.mandatory, icon: "party-popper" },
    bank: { label: moneyStrings.incBank, color: CHART_COLORS.bank, icon: "coins" },
    fromSavings: { label: moneyStrings.incFromSavings, color: moneyColors.goal, icon: "arrow-up" },
    other: { label: moneyStrings.catOther, color: CHART_COLORS.other, icon: "coins" },
  },
};

export function JournalPanel() {
  const { content, rows, today } = useRecord();
  const [period, setPeriod] = useState<JournalPeriod>("all");
  const [flow, setFlow] = useState<JournalFlow>("spend");
  const lookup = useMemo(() => itemLookup(content.catalog, content.goals), [content]);
  const stats = useMemo(() => journalStats(rows, period, today, lookup), [rows, period, today, lookup]);
  const groups = useMemo(() => groupByDay(stats.entries), [stats.entries]);
  const itemName = (id: string | null) =>
    content.catalog.find((item) => item.id === id)?.name ??
    content.goals.find((goal) => goal.id === id)?.name ??
    id ??
    "";
  const journalAmount = (entry: JournalEntry) => {
    if (entry.kind === "purchase" && entry.amount === 0 && entry.itemId) {
      return -(lookup(entry.itemId)?.price ?? 0);
    }
    return entry.amount;
  };
  const taskTitle = (id: string) => content.tasks.find((task) => task.id === id)?.title;

  const totals = flow === "spend" ? stats.spend : stats.income;
  const legend: LegendRow[] = totals.map((row) => ({
    id: row.category,
    label: CATEGORY[flow][row.category].label,
    color: CATEGORY[flow][row.category].color,
    amount: row.amount,
    percent: row.percent,
  }));
  const flowLabel = flow === "spend" ? moneyStrings.flowSpend : moneyStrings.flowIncome;
  const periodLabel = PERIODS.find((option) => option.id === period)?.label ?? "";
  const flowTotal = flow === "spend" ? stats.wentOut : stats.cameIn;

  const describe = (entry: JournalEntry) => {
    const row = classify(entry, lookup);
    if (entry.kind === "purchase") {
      const kind = lookup(entry.itemId)?.kind;
      const meta = CATEGORY.spend[kind ?? "other"];
      return {
        title: itemName(entry.itemId),
        subtitle: entry.amount === 0 ? `${meta.label} · ${moneyStrings.journalFromSavings}` : meta.label,
        icon: meta.icon,
        tint: meta.color,
      };
    }
    const meta = row ? CATEGORY[row.flow][row.category] : CATEGORY.spend.other;
    return { title: journalLabel(entry, itemName, taskTitle), subtitle: meta.label, icon: meta.icon, tint: meta.color };
  };

  return (
    <>
      <PillRow options={PERIODS} value={period} onChange={setPeriod} />
      <TileRow>
        <StatTile
          label={moneyStrings.tileIn}
          value={stats.cameIn}
          spoken={moneyStrings.statA11y(moneyStrings.tileIn, stats.cameIn)}
        />
        <StatTile
          label={moneyStrings.tileOut}
          value={stats.wentOut}
          spoken={moneyStrings.statA11y(moneyStrings.tileOut, stats.wentOut)}
        />
        <StatTile
          label={moneyStrings.tileNet}
          value={stats.net}
          spoken={moneyStrings.statA11y(moneyStrings.tileNet, stats.net)}
        />
      </TileRow>
      <MoneyCard>
        <PillRow grow options={FLOWS} value={flow} onChange={setFlow} />
        <View style={styles.chart}>
          <DonutChart
            size={148}
            thickness={26}
            slices={legend.map((row) => ({ id: row.id, label: row.label, value: row.amount, color: row.color }))}
            centerValue={flowTotal}
            centerCaption={flowLabel.toLowerCase()}
            accessibilityLabel={moneyStrings.journalChartA11y(flowLabel, periodLabel, legend)}
          />
        </View>
        {legend.length === 0 ? (
          <Text style={styles.muted}>{moneyStrings.journalChartEmpty}</Text>
        ) : (
          <Legend rows={legend} />
        )}
      </MoneyCard>
      <SectionTitle>{moneyStrings.journalOps}</SectionTitle>
      {groups.length === 0 ? <Text style={styles.muted}>{moneyStrings.journalEmpty}</Text> : null}
      {groups.map(([dayN, entries]) => {
        const dayNet = entries.reduce((sum, entry) => sum + entry.amount, 0);
        return (
          <View key={dayN} style={styles.dayGroup}>
            <View style={styles.dayHead}>
              <Text role="heading" style={styles.dayTitle}>
                {dayN === 0 ? strings.journalStart : strings.journalDay(dayN)}
              </Text>
              <Text aria-hidden style={styles.dayNet}>
                {moneyStrings.journalDayTotal(dayNet)}
              </Text>
            </View>
            <MoneyCard tight>
              {entries.map((entry, index) => {
                const amount = journalAmount(entry);
                const view = describe(entry);
                return (
                  <OpRow
                    key={entry.id}
                    icon={view.icon}
                    tint={view.tint}
                    title={view.title}
                    subtitle={view.subtitle}
                    amount={amount}
                    label={moneyStrings.journalRowA11y(
                      journalLabel(entry, itemName, taskTitle),
                      strings.journalAmount(amount),
                    )}
                    last={index === entries.length - 1}
                  />
                );
              })}
            </MoneyCard>
          </View>
        );
      })}
    </>
  );
}

export function ResultsBody() {
  const { content, lastClosed, tasks, goalCount } = useRecord();
  const topicTasks = playableTasks(content.tasks);
  const completedTopics = tasks.filter((row) => {
    if (row.status !== "completed") return false;
    return topicTasks.some((task) => task.id === row.taskKey);
  }).length;

  if (!lastClosed) {
    return (
      <Card>
        <Text style={styles.body}>{strings.resultsEmpty}</Text>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <Text style={styles.section}>{strings.resultsLastDay(lastClosed.n)}</Text>
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
      </Card>
      <Card>
        <Text style={styles.section}>{strings.resultsOverall}</Text>
        <Text style={styles.body}>{strings.resultsDaysPlayed(lastClosed.n)}</Text>
        <Text style={styles.body}>{strings.resultsTasksDone(completedTopics, topicTasks.length)}</Text>
        <Text style={styles.body}>{strings.resultsGoalsAchieved(goalCount)}</Text>
      </Card>
    </>
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
      <GlyphLabel glyph={pictogram} label={label} labelStyle={styles.body} />
      <CoinText coin text={strings.planVsActual(plan, actual)} style={styles.body} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  chart: {
    alignItems: "center",
    paddingVertical: spacing.s,
  },
  muted: {
    color: colors.subtle,
    fontSize: type.body,
  },
  dayGroup: {
    gap: spacing.s,
  },
  dayHead: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
  },
  dayTitle: {
    color: colors.subtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  dayNet: {
    color: colors.subtle,
    fontFamily: font.pixel,
    fontSize: 12,
  },
  fact: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
});
