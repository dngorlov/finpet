import { useCallback, useState } from "react";
import { BackHandler, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { CoinText } from "../components/CoinText";
import { ScreenTitle } from "../components/ScreenTitle";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { rewardLeft, scoredUnits } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "TaskResult">;

export default function TaskResultScreen({ navigation, route }: Props) {
  const { content, game, meta } = useSession();
  const { setTab } = usePlayChrome();
  const { taskId, reward, earned, points, sceneCoins, dayEnded } = route.params;
  const task = content.tasks.find((item) => item.id === taskId);
  const total = task ? scoredUnits(task) : 0;
  const [best] = useState(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return earned;
    return game.listTaskProgress(profileId).find((row) => row.taskKey === taskId)?.bestReward ?? earned;
  });
  const [feedback, setFeedback] = useState<FeedbackModel | null>(() => {
    const coins = reward + sceneCoins;
    if (coins <= 0) return null;
    return {
      deltas: { balance: coins },
      cause: reward > 0 ? strings.feedbackCauseTaskReward : strings.feedbackCauseTaskScene,
      nextStep: reward > 0 ? strings.feedbackNextTaskReward : strings.feedbackNextTaskScene,
    };
  });

  const leave = useCallback(() => {
    if (dayEnded) {
      navigation.replace("DaySummary");
      return;
    }
    setTab("map");
    navigation.popTo("Main");
  }, [dayEnded, navigation, setTab]);

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

  return (
    <Screen
      footer={<PrimaryButton label={dayEnded ? strings.daySummaryTitle : strings.taskBackToMap} onPress={leave} />}
    >
      <BackButton onPress={dayEnded ? leave : undefined} />
      <ScreenTitle style={styles.title}>{task?.title ?? strings.navTasks}</ScreenTitle>
      {total > 0 ? <CoinText text={strings.taskScore(formatPoints(points), total)} style={styles.body} /> : null}
      {reward > 0 ? <CoinText text={strings.taskEarned(reward)} style={styles.section} /> : null}
      {reward === 0 && earned > 0 ? <CoinText text={strings.taskNoTopUp} style={styles.body} /> : null}
      {task ? <CoinText coin text={strings.missionRewardLeft(rewardLeft(task, best))} style={styles.body} /> : null}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </Screen>
  );
}

/** 3.5 → «3,5»: half points come from «с ценой» answers. */
function formatPoints(points: number): string {
  return Number.isInteger(points) ? String(points) : String(points).replace(".", ",");
}

const styles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: type.body,
  },
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
});
