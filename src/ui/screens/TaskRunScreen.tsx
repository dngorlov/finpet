import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { factFromSpending } from "../../core/budgetGames";
import {
  chooseOption,
  earnedReward,
  endsGameDay,
  startTask,
  type BudgetSplit,
  type NextRef,
  type TaskEffect,
  type TaskStepResult,
  type Verdict,
} from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { ProfileView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { CoinText } from "../components/CoinText";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import type { PetPose } from "../pet/keys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";
import { AllocateBoard, ReplanBoard } from "../games/BudgetBoard";
import { CompareBoard } from "../games/CompareBoard";
import { OptionTiles, SceneTiles, VerdictBanner } from "../games/GameParts";
import { gameStrings } from "../games/gameStrings";
import { DreamGame, StepsGame } from "../games/SavingGames";
import { SortBoard } from "../games/SortBoard";

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
  /** План и факт: the child's plan and what the choices spent since. */
  const [plan, setPlan] = useState<BudgetSplit | null>(null);
  const [spent, setSpent] = useState<Partial<BudgetSplit>>({});

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
      setPlan(null);
      setSpent({});
    }, [game, meta, task]),
  );

  if (!task || !profile || !nodeId) {
    return (
      <Screen>
        <BackButton />
        <CoinText text={strings.navTasks} style={styles.body} />
      </Screen>
    );
  }

  const node = task.nodes.find((item) => item.id === nodeId);
  const kind = node?.kind ?? "choice";
  const explaining = result !== null;
  const withPet = (text: string) => text.split("{pet}").join(profile.petName);

  const remember = (key: string, verdict: Verdict) => {
    setFirstVerdicts((current) => (key in current ? current : { ...current, [key]: verdict }));
  };

  const finish = (lastStep: TaskStepResult | null, verdicts: Record<string, Verdict>) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    const earned = earnedReward(task, Object.values(verdicts));
    const alreadyCompleted = game
      .listTaskProgress(profileId)
      .some((row) => row.taskKey === task.id && row.status === "completed");
    const dayEnded = endsGameDay(task) && !alreadyCompleted;
    const reward = game.claimTaskReward(
      profileId,
      day.dayId,
      task.id,
      earned,
      dayEnded ? { task, catalog: content.catalog, bills: content.bills } : undefined,
    );
    navigation.replace("TaskResult", {
      taskId: task.id,
      reward,
      earned,
      sceneCoins: lastStep ? coinDelta(lastStep.effects) : 0,
      points: Object.values(verdicts).reduce((sum, v) => sum + (v === "good" ? 1 : v === "warn" ? 0.5 : 0), 0),
      dayEnded,
    });
  };

  const goTo = (next: NextRef, lastStep: TaskStepResult | null, verdicts: Record<string, Verdict>) => {
    if (next === "exit") {
      finish(lastStep, verdicts);
      return;
    }
    setNodeId(next);
    setResult(null);
  };

  const choose = (optionIndex: number) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || !node) return;
    const day = game.dayState(profileId);
    const step = chooseOption(task, node.id, optionIndex);
    game.applyTaskStep(profileId, day.dayId, step);
    setProfile(game.getProfile(profileId));
    remember(node.id, step.verdict);
    const spend = node.options?.[optionIndex]?.spend;
    if (spend && step.next !== "retry") {
      setSpent((current) => ({ ...current, [spend.bucket]: (current[spend.bucket] ?? 0) + spend.amount }));
    }
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
    if (!node) return;
    // Answers were recorded on earlier presses, so state already holds them.
    const verdicts = { ...firstVerdicts };
    if (kind !== "choice") {
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

  const tileMode = kind === "choice" && (node?.options?.every((option) => option.icon) ?? false);
  const footer =
    kind === "card" ? (
      <PrimaryButton label={node?.button ?? strings.taskCardNext} onPress={goNext} />
    ) : kind === "choice" && explaining ? (
      <PrimaryButton label={result?.next === "retry" ? gameStrings.retry : strings.next} onPress={goNext} />
    ) : kind === "choice" && !tileMode ? (
      <>
        {node?.options?.map((option, index) => (
          <PrimaryButton key={`${node.id}-${index}`} label={withPet(option.label)} onPress={() => choose(index)} />
        ))}
      </>
    ) : null;
  const shownVerdict = result?.verdict;
  const isCard = kind === "card";

  return (
    <Screen footer={footer}>
      <View style={styles.top}>
        <BackButton />
        {node?.title === task.title ? null : (
          <Text style={styles.taskTitle} numberOfLines={1}>
            {task.title}
          </Text>
        )}
      </View>
      <View style={isCard ? styles.cardHero : styles.petRow}>
        <PetView
          species={profile.species}
          color={profile.color}
          accessory={profile.accessory}
          petName={profile.petName}
          care={profile.care}
          mood={profile.mood}
          size={isCard ? 120 : 88}
          pose={shownVerdict ? poseForVerdict(shownVerdict) : undefined}
        />
      </View>
      {node?.id === task.nodes[0]?.id && kind === "choice" ? (
        <CoinText text={withPet(task.intro)} style={styles.body} />
      ) : null}
      {isCard && node ? (
        <View style={styles.lessonCard}>
          {node.title ? <CoinText text={withPet(node.title)} style={styles.section} /> : null}
          <CoinText text={withPet(node.text)} style={styles.body} />
        </View>
      ) : null}
      {!isCard && node ? (
        <View style={styles.verdict}>
          {node.title ? <CoinText text={withPet(node.title)} style={styles.section} /> : null}
          <CoinText text={withPet(node.text)} style={kind === "choice" ? styles.section : styles.body} />
        </View>
      ) : null}
      {kind === "choice" && node?.scene ? <SceneTiles tiles={node.scene} /> : null}
      {tileMode && node?.options && !explaining ? (
        <OptionTiles options={node.options} onChoose={choose} withPet={withPet} />
      ) : null}
      {kind === "sort" && node ? (
        <SortBoard
          key={node.id}
          bins={node.bins ?? []}
          items={node.items ?? []}
          withPet={withPet}
          onAnswer={(index, verdict) => remember(`${node.id}#${index}`, verdict)}
          onDone={goNext}
        />
      ) : null}
      {kind === "allocate" && node ? (
        <AllocateBoard
          key={node.id}
          total={node.total ?? 100}
          onDone={(split) => {
            setPlan(split);
            setSpent({});
            goNext();
          }}
        />
      ) : null}
      {kind === "compare" && node ? (
        <CompareBoard
          key={node.id}
          plan={plan ?? { mandatory: 0, wants: 0, savings: node.total ?? 100 }}
          fact={factFromSpending(node.total ?? 100, spent)}
          onDone={goNext}
        />
      ) : null}
      {kind === "replan" && node && node.plan && node.event ? (
        <ReplanBoard
          key={node.id}
          total={node.total ?? 100}
          plan={node.plan}
          event={node.event}
          outcomes={node.outcomes}
          withPet={withPet}
          onDone={goNext}
        />
      ) : null}
      {kind === "steps" && node && node.goal ? (
        <StepsGame
          key={node.id}
          goal={node.goal}
          saved={node.saved ?? 0}
          amounts={node.amounts ?? [5]}
          income={node.income ?? 10}
          temptations={node.temptations}
          petName={profile.petName}
          onDone={goNext}
        />
      ) : null}
      {kind === "dream" && node ? (
        <DreamGame
          key={node.id}
          goals={node.goals ?? []}
          saved={node.saved ?? 0}
          amounts={node.amounts ?? [5, 10]}
          days={node.days}
          onDone={goNext}
        />
      ) : null}
      {result ? (
        <View style={styles.verdict}>
          <VerdictBanner verdict={result.verdict} text={withPet(result.explanation)} />
          {result.effects.map((effect, index) =>
            effect.meter && effect.delta ? (
              <CoinText
                key={`${effect.meter}-${index}`}
                text={effect.meter === "care" ? strings.feedbackCare(effect.delta) : strings.feedbackMood(effect.delta)}
                style={styles.body}
              />
            ) : null,
          )}
          {result.spawnTask ? <CoinText text={strings.taskSpawned} style={styles.body} /> : null}
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
  verdictTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  top: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  taskTitle: {
    color: colors.subtle,
    flex: 1,
    fontSize: type.body,
    fontWeight: "700",
  },
  petRow: {
    alignItems: "center",
  },
  cardHero: {
    alignItems: "center",
    backgroundColor: colors.highlight,
    borderRadius: radius.card,
    paddingVertical: spacing.m,
  },
  lessonCard: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: radius.card,
    borderWidth: 2,
    gap: spacing.s,
    padding: spacing.m,
  },
});
