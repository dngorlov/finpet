import { useState } from "react";
import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "TaskResult">;

export default function TaskResultScreen({ navigation, route }: Props) {
  const { content } = useSession();
  const { taskId, reward, sceneCoins } = route.params;
  const task = content.tasks.find((item) => item.id === taskId);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(() => {
    const coins = reward + sceneCoins;
    if (coins <= 0) return null;
    return {
      deltas: { balance: coins },
      cause: reward > 0 ? strings.feedbackCauseTaskReward : strings.feedbackCauseTaskScene,
      nextStep: reward > 0 ? strings.feedbackNextTaskReward : strings.feedbackNextTaskScene,
    };
  });

  return (
    <Screen
      footer={
        <PrimaryButton label={strings.taskBackToList} onPress={() => navigation.navigate("TaskList")} />
      }
    >
      <BackButton />
      <Text style={styles.title}>{task?.title ?? strings.navTasks}</Text>
      {reward > 0 ? <Text style={styles.section}>{strings.taskRewardCoins}</Text> : null}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
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
});
