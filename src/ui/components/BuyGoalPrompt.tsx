import { useEffect, useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import { meterDeltaMap } from "../../core/economy";
import { META_KEYS } from "../../data/metaKeys";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { resolveCurrentTask } from "../tasks/resolveCurrentTask";
import { colors, radius, spacing, type } from "../theme";
import { FeedbackCard, type FeedbackModel } from "./FeedbackCard";
import { PrimaryButton } from "./PrimaryButton";
import { ScreenTitle } from "./ScreenTitle";
import { TextButton } from "./TextButton";

/** Shown while Копилка covers the active Цель. Позже hides it until the bar is tapped again. */
export function BuyGoalPrompt() {
  const { game, meta, content } = useSession();
  const { revision, focus, setFocus, touchChrome } = usePlayChrome();
  const [hiddenKey, setHiddenKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  void revision;

  const profileId = meta.get(META_KEYS.activeProfileId);
  const task = profileId ? resolveCurrentTask(game, content, profileId) : null;
  const goalId = task?.kind === "buy-goal" ? task.goalId : null;
  const goal = goalId ? content.goals.find((item) => item.id === goalId) : undefined;

  useEffect(() => {
    if (focus?.kind === "buy-goal") setHiddenKey(null);
  }, [focus]);

  const dismiss = () => {
    if (goal) setHiddenKey(goal.id);
    setFocus(null);
  };

  const buy = () => {
    if (!profileId || !goal) return;
    const day = game.dayState(profileId);
    const item = {
      id: goal.id,
      kind: "optional" as const,
      price: goal.price,
      effect: goal.effect,
      once: true as const,
      stage: goal.stage,
    };
    const result = game.purchaseFromSavings(profileId, day.dayId, item);
    if (result.status === "blocked") return;
    touchChrome();
    setHiddenKey(goal.id);
    setFocus(null);
    setFeedback({
      deltas: {
        savings: -goal.price,
        ...meterDeltaMap(goal),
      },
      cause: result.stageExplanation ?? strings.feedbackCausePurchase,
      nextStep: strings.feedbackNextGoal,
    });
  };

  if (feedback) return <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} />;
  if (!goal || hiddenKey === goal.id) return null;

  return (
    <Modal animationType="slide" transparent visible onRequestClose={dismiss}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <ScreenTitle style={styles.title}>{strings.savingsAchieved}</ScreenTitle>
          <Text style={styles.body}>{goal.name}</Text>
          <Text style={styles.body}>{strings.shopPrice(goal.price)}</Text>
          <TextButton label={strings.savingsLater} onPress={dismiss} />
          <PrimaryButton label={strings.savingsBuyFromSavings} onPress={buy} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    gap: spacing.s,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
