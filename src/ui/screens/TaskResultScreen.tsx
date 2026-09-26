import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { CHART_COLORS, DonutChart } from "../components/DonutChart";
import { CoinText } from "../components/CoinText";
import { ScreenTitle } from "../components/ScreenTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { rewardLeft, scoredUnits } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import { playStoredCue } from "../sound/playCue";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";
import { moneyStrings } from "../stringsMoney";
import type { PixelIconName } from "../pixelIconXml";
import {
  Amount,
  HeroCard,
  Legend,
  MoneyCard,
  moneyColors,
  OpRow,
  ProgressBar,
  StatTile,
  TileRow,
} from "./moneyParts";
import { OpenedToolCard, openedToolForTask } from "./openedTool";

type Props = NativeStackScreenProps<RootStackParamList, "TaskResult">;

type MoveLine = {
  key: string;
  icon: PixelIconName;
  title: string;
  amount: number;
  label: string;
};

export default function TaskResultScreen({ navigation, route }: Props) {
  const { content, game, meta } = useSession();
  const { setTab } = usePlayChrome();
  const { taskId, reward, earned, points, sceneCoins, dayEnded } = route.params;
  const task = content.tasks.find((item) => item.id === taskId);
  const total = task ? scoredUnits(task) : 0;
  const max = task?.reward ?? 0;
  const [best] = useState(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return earned;
    return game.listTaskProgress(profileId).find((row) => row.taskKey === taskId)?.bestReward ?? earned;
  });
  const left = task ? rewardLeft(task, best) : 0;
  const collectedPercent = max > 0 ? Math.round((best / max) * 100) : 0;
  const delta = reward + sceneCoins;
  const profileId = meta.get(META_KEYS.activeProfileId);
  const profile = profileId ? game.getProfile(profileId) : null;
  const balanceAfter = profile ? profile.balance : delta;
  const balanceBefore = balanceAfter - delta;
  const moves = moveLines(task?.title ?? strings.navTasks, reward, sceneCoins);
  const openedTool = dayEnded && profile && !profile.isDemo ? openedToolForTask(taskId) : null;

  const playedComplete = useRef(false);
  useEffect(() => {
    if (playedComplete.current) return;
    playedComplete.current = true;
    void playStoredCue("complete", meta);
  }, [meta]);

  const leave = useCallback(() => {
    if (dayEnded) {
      navigation.replace("DaySummary", openedTool ? { openedTool } : undefined);
      return;
    }
    setTab("map");
    navigation.popTo("Main");
  }, [dayEnded, navigation, openedTool, setTab]);

  useFocusEffect(
    useCallback(() => {
      if (!dayEnded) return;
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        leave();
        return true;
      });
      return () => subscription.remove();
    }, [dayEnded, leave]),
  );

  const showNote = (reward === 0 && earned > 0) || Boolean(task);

  return (
    <Screen
      footer={<PrimaryButton label={dayEnded ? strings.daySummaryTitle : strings.taskBackToMap} onPress={leave} />}
    >
      <BackButton onPress={dayEnded ? leave : undefined} />
      {openedTool ? <OpenedToolCard tool={openedTool} /> : null}
      <ScreenTitle style={styles.title}>{task?.title ?? strings.navTasks}</ScreenTitle>
      <BalanceReceipt before={balanceBefore} after={balanceAfter} delta={delta} reward={reward} moves={moves} />
      {total > 0 ? (
        <View style={styles.scoreBlock}>
          <Text style={styles.score}>{strings.taskScore(formatPoints(points), total)}</Text>
          <ProgressBar value={points} max={total} color={points >= total ? colors.fill : colors.accent} />
        </View>
      ) : null}
      <TileRow>
        <StatTile
          label={strings.taskResultRun}
          value={earned}
          spoken={strings.taskResultStat(strings.taskResultRun, earned)}
        />
        <StatTile
          label={strings.taskResultRecord}
          value={best}
          spoken={strings.taskResultStat(strings.taskResultRecord, best)}
        />
        <StatTile
          label={strings.taskResultMore}
          value={left}
          spoken={strings.taskResultStat(strings.taskResultMore, left)}
        />
      </TileRow>
      {showNote ? (
        <MoneyCard>
          {max > 0 ? (
            <>
              <View style={styles.chart}>
                <DonutChart
                  size={148}
                  thickness={26}
                  slices={[
                    { id: "got", label: strings.taskResultCollected, value: best, color: CHART_COLORS.tasks },
                    { id: "left", label: strings.taskResultMore, value: left, color: CHART_COLORS.other },
                  ]}
                  centerValue={best}
                  accessibilityLabel={strings.missionRewardBest(best, max)}
                />
              </View>
              <Legend
                rows={[
                  {
                    id: "got",
                    label: strings.taskResultCollected,
                    color: CHART_COLORS.tasks,
                    amount: best,
                    percent: collectedPercent,
                  },
                  {
                    id: "left",
                    label: strings.taskResultMore,
                    color: CHART_COLORS.other,
                    amount: left,
                    percent: 100 - collectedPercent,
                  },
                ]}
              />
            </>
          ) : null}
          {reward === 0 && earned > 0 ? <CoinText text={strings.taskNoTopUp} style={styles.body} /> : null}
          {task ? <CoinText coin text={strings.missionRewardLeft(left)} style={styles.body} /> : null}
        </MoneyCard>
      ) : null}
    </Screen>
  );
}

/** Account card plus the journal row for the coins this mission just added. */
function BalanceReceipt({
  before,
  after,
  delta,
  reward,
  moves,
}: {
  before: number;
  after: number;
  delta: number;
  reward: number;
  moves: readonly MoveLine[];
}) {
  const arrival =
    reward > 0 && delta === reward ? strings.taskEarned(reward) : strings.taskResultStat(moneyStrings.tileIn, delta);
  return (
    <View style={styles.receipt}>
      <HeroCard caption={strings.balanceWord} value={after} label={strings.balanceBadge(after)}>
        <View style={styles.heroDivider} />
        <View accessible aria-label={strings.taskResultStat(strings.taskBalanceWas, before)} style={styles.heroRow}>
          <Text style={styles.heroLabel}>{strings.taskBalanceWas}</Text>
          <Amount value={before} size={16} color={moneyColors.heroText} />
        </View>
        {delta !== 0 ? (
          <View accessible aria-label={arrival} style={styles.heroRow}>
            <Text style={styles.heroLabel}>{moneyStrings.tileIn}</Text>
            <Amount value={delta} signed size={16} color={moneyColors.heroText} />
          </View>
        ) : null}
      </HeroCard>
      {moves.length > 0 ? (
        <MoneyCard tight>
          {moves.map((line, index) => (
            <OpRow
              key={line.key}
              icon={line.icon}
              tint={CHART_COLORS.tasks}
              title={line.title}
              subtitle={moneyStrings.incTasks}
              amount={line.amount}
              label={line.label}
              last={index === moves.length - 1}
            />
          ))}
        </MoneyCard>
      ) : null}
    </View>
  );
}

function moveLines(title: string, reward: number, sceneCoins: number): MoveLine[] {
  const lines: MoveLine[] = [];
  if (reward !== 0) {
    const rowTitle = strings.journalTaskReward(title);
    lines.push({
      key: "reward",
      icon: "map",
      title: rowTitle,
      amount: reward,
      label:
        sceneCoins > 0
          ? strings.taskEarned(reward)
          : moneyStrings.journalRowA11y(rowTitle, strings.journalAmount(reward)),
    });
  }
  if (sceneCoins !== 0) {
    const rowTitle = strings.journalTaskScene;
    lines.push({
      key: "scene",
      icon: "coins",
      title: rowTitle,
      amount: sceneCoins,
      label: moneyStrings.journalRowA11y(rowTitle, strings.journalAmount(sceneCoins)),
    });
  }
  return lines;
}

/** 3.5 → «3,5»: half points come from «с ценой» answers. */
function formatPoints(points: number): string {
  return Number.isInteger(points) ? String(points) : String(points).replace(".", ",");
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  receipt: {
    gap: spacing.m,
  },
  heroDivider: {
    backgroundColor: moneyColors.heroTrack,
    height: 1,
    marginVertical: 4,
  },
  heroRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "space-between",
  },
  heroLabel: {
    color: moneyColors.heroSubtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  scoreBlock: {
    gap: spacing.s,
  },
  score: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  chart: {
    alignItems: "center",
    paddingVertical: spacing.s,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
