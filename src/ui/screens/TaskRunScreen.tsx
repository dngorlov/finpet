import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { chooseOption, startTask, type TaskEffect, type TaskStepResult, type Verdict } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { ProfileView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import type { PetPose } from "../pet/keys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "TaskRun">;

function poseForVerdict(verdict: Verdict): PetPose {
  if (verdict === "good") return "happy";
  if (verdict === "bad") return "sad";
  return "idle";
}

function coinDelta(effects: readonly TaskEffect[]): number {
  return effects.reduce((sum, effect) => sum + (effect.coins && effect.coins > 0 ? effect.coins : 0), 0);
}

export default function TaskRunScreen({ navigation, route }: Props) {
  const { taskId } = route.params;
  const { game, meta, content } = useSession();
  const task = content.tasks.find((item) => item.id === taskId);
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [nodeId, setNodeId] = useState<string | null>(null);
  const [result, setResult] = useState<TaskStepResult | null>(null);
  const [sceneFeedback, setSceneFeedback] = useState<FeedbackModel | null>(null);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId || !task) return;
      setProfile(game.getProfile(profileId));
      const start = startTask(task);
      setNodeId(start.nodeId);
      setResult(null);
      setSceneFeedback(null);
    }, [game, meta, task]),
  );

  if (!task || !profile || !nodeId) {
    return (
      <Screen>
        <BackButton />
        <Text style={styles.body}>{strings.navTasks}</Text>
      </Screen>
    );
  }

  const node = task.nodes.find((item) => item.id === nodeId);
  const explaining = result !== null;

  const choose = (optionIndex: number) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !node) return;
    const day = game.dayState(profileId);
    const step = chooseOption(task, node.id, optionIndex);
    game.applyTaskStep(profileId, day.dayId, step);
    setProfile(game.getProfile(profileId));
    setResult(step);
    const coins = coinDelta(step.effects);
    if (coins > 0 && step.next !== "exit") {
      setSceneFeedback({
        deltas: { balance: coins },
        cause: strings.feedbackCauseTaskScene,
        nextStep: strings.feedbackNextTaskScene,
      });
    }
  };

  const goNext = () => {
    if (!result) return;
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    if (result.next === "retry") {
      setResult(null);
      return;
    }
    if (result.next === "exit") {
      const day = game.dayState(profileId);
      const correct = result.verdict === "good" || result.verdict === "warn";
      const reward = game.claimTaskReward(profileId, day.dayId, task.id, correct);
      navigation.replace("TaskResult", {
        taskId: task.id,
        reward,
        sceneCoins: coinDelta(result.effects),
      });
      return;
    }
    setNodeId(result.next);
    setResult(null);
  };

  const footer = explaining ? (
    <PrimaryButton label={strings.next} onPress={goNext} />
  ) : (
    <>
      {node?.options.map((option, index) => (
        <PrimaryButton key={`${node.id}-${index}`} label={option.label} onPress={() => choose(index)} />
      ))}
    </>
  );

  return (
    <Screen footer={footer}>
      <BackButton />
      <PetView
        species={profile.species}
        color={profile.color}
        accessory={profile.accessory}
        petName={profile.petName}
        care={profile.care}
        mood={profile.mood}
        pose={result ? poseForVerdict(result.verdict) : undefined}
      />
      <Text style={styles.body}>{task.intro}</Text>
      {node ? <Text style={styles.section}>{node.text}</Text> : null}
      {result ? (
        <View accessible role="status" aria-label={strings.verdictLabel(result.verdict)} style={styles.verdict}>
          <Text style={styles.section}>{strings.verdictLabel(result.verdict)}</Text>
          <Text style={styles.body}>{result.explanation}</Text>
          {result.effects.map((effect, index) =>
            effect.meter && effect.delta ? (
              <Text key={`${effect.meter}-${index}`} style={styles.body}>
                {effect.meter === "care" ? strings.feedbackCare(effect.delta) : strings.feedbackMood(effect.delta)}
              </Text>
            ) : null,
          )}
          {result.spawnTask ? <Text style={styles.body}>{strings.taskSpawned}</Text> : null}
        </View>
      ) : null}
      {sceneFeedback ? <FeedbackCard model={sceneFeedback} onDismiss={() => setSceneFeedback(null)} /> : null}
    </Screen>
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
  verdict: {
    gap: spacing.s,
  },
});
