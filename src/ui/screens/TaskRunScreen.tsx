import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  chooseOption,
  earnedReward,
  sortVerdict,
  startTask,
  type NextRef,
  type TaskEffect,
  type TaskStepResult,
  type Verdict,
} from "../../core/tasks";
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
  /** First answer per scored unit (choice node id, or node#item for sort) — the score. */
  const [firstVerdicts, setFirstVerdicts] = useState<Record<string, Verdict>>({});
  const [sortIndex, setSortIndex] = useState(0);
  const [sortResult, setSortResult] = useState<{ verdict: Verdict; explanation: string } | null>(null);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId || !task) return;
      setProfile(game.getProfile(profileId));
      const start = startTask(task);
      setNodeId(start.nodeId);
      setResult(null);
      setSceneFeedback(null);
      setFirstVerdicts({});
      setSortIndex(0);
      setSortResult(null);
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
  const kind = node?.kind ?? "choice";
  const explaining = result !== null || sortResult !== null;
  const withPet = (text: string) => text.split("{pet}").join(profile.petName);

  const remember = (key: string, verdict: Verdict) => {
    setFirstVerdicts((current) => (key in current ? current : { ...current, [key]: verdict }));
  };

  const finish = (lastStep: TaskStepResult | null, verdicts: Record<string, Verdict>) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    const earned = earnedReward(task, Object.values(verdicts));
    const reward = game.claimTaskReward(profileId, day.dayId, task.id, earned);
    navigation.replace("TaskResult", {
      taskId: task.id,
      reward,
      earned,
      sceneCoins: lastStep ? coinDelta(lastStep.effects) : 0,
      points: Object.values(verdicts).reduce((sum, v) => sum + (v === "good" ? 1 : v === "warn" ? 0.5 : 0), 0),
    });
  };

  const goTo = (next: NextRef, lastStep: TaskStepResult | null, verdicts: Record<string, Verdict>) => {
    if (next === "exit") {
      finish(lastStep, verdicts);
      return;
    }
    setNodeId(next);
    setResult(null);
    setSortIndex(0);
    setSortResult(null);
  };

  const choose = (optionIndex: number) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !node) return;
    const day = game.dayState(profileId);
    const step = chooseOption(task, node.id, optionIndex);
    game.applyTaskStep(profileId, day.dayId, step);
    setProfile(game.getProfile(profileId));
    remember(node.id, step.verdict);
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

  const sortInto = (bin: number) => {
    const item = node?.items?.[sortIndex];
    if (!node || !item) return;
    const verdict = sortVerdict(item, bin);
    remember(`${node.id}#${sortIndex}`, verdict);
    setSortResult({ verdict, explanation: item.explanation });
  };

  const goNext = () => {
    if (!node) return;
    // Answers were recorded on earlier presses, so state already holds them.
    const verdicts = { ...firstVerdicts };
    if (kind === "card") {
      goTo(node.next ?? "exit", null, verdicts);
      return;
    }
    if (kind === "sort") {
      // A wrong basket is a safe error: try the same item again (score keeps the first answer).
      if (sortResult?.verdict === "bad") {
        setSortResult(null);
        return;
      }
      const total = node.items?.length ?? 0;
      if (sortIndex + 1 < total) {
        setSortIndex(sortIndex + 1);
        setSortResult(null);
        return;
      }
      goTo(node.next ?? "exit", null, verdicts);
      return;
    }
    if (!result) return;
    if (result.next === "retry") {
      setResult(null);
      return;
    }
    goTo(result.next, result, verdicts);
  };

  const sortItem = kind === "sort" ? node?.items?.[sortIndex] : undefined;
  const footer =
    kind === "card" ? (
      <PrimaryButton label={node?.button ?? strings.taskCardNext} onPress={goNext} />
    ) : explaining ? (
      <PrimaryButton label={strings.next} onPress={goNext} />
    ) : kind === "sort" ? (
      <>
        {node?.bins?.map((bin, index) => (
          <PrimaryButton key={`${node.id}-bin-${index}`} label={bin} onPress={() => sortInto(index)} />
        ))}
      </>
    ) : (
      <>
        {node?.options?.map((option, index) => (
          <PrimaryButton key={`${node.id}-${index}`} label={withPet(option.label)} onPress={() => choose(index)} />
        ))}
      </>
    );
  const shownVerdict = result?.verdict ?? sortResult?.verdict;

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
        pose={shownVerdict ? poseForVerdict(shownVerdict) : undefined}
      />
      {node?.id === task.nodes[0]?.id && kind === "choice" ? <Text style={styles.body}>{withPet(task.intro)}</Text> : null}
      {kind === "card" && node ? (
        <View style={styles.verdict}>
          {node.title ? <Text style={styles.section}>{withPet(node.title)}</Text> : null}
          <Text style={styles.body}>{withPet(node.text)}</Text>
        </View>
      ) : null}
      {kind === "choice" && node ? <Text style={styles.section}>{withPet(node.text)}</Text> : null}
      {kind === "sort" && node ? (
        <View style={styles.verdict}>
          <Text style={styles.section}>{withPet(node.text)}</Text>
          <Text style={styles.body}>{strings.taskSortProgress(sortIndex + 1, node.items?.length ?? 0)}</Text>
          {sortItem ? <Text style={styles.item}>{withPet(sortItem.label)}</Text> : null}
          {sortResult ? null : <Text style={styles.body}>{strings.taskSortPrompt}</Text>}
        </View>
      ) : null}
      {result || sortResult ? (
        <View
          accessible
          role="status"
          aria-label={strings.verdictLabel((result?.verdict ?? sortResult?.verdict)!)}
          style={styles.verdict}
        >
          <Text style={styles.section}>{strings.verdictLabel((result?.verdict ?? sortResult?.verdict)!)}</Text>
          <Text style={styles.body}>{withPet((result?.explanation ?? sortResult?.explanation)!)}</Text>
          {result?.effects.map((effect, index) =>
            effect.meter && effect.delta ? (
              <Text key={`${effect.meter}-${index}`} style={styles.body}>
                {effect.meter === "care" ? strings.feedbackCare(effect.delta) : strings.feedbackMood(effect.delta)}
              </Text>
            ) : null,
          )}
          {result?.spawnTask ? <Text style={styles.body}>{strings.taskSpawned}</Text> : null}
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
  item: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
    textAlign: "center",
  },
});
