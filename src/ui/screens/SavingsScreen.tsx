import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { METERS } from "../../core/config";
import { applyGoalProgress, estimateDaysToGoal } from "../../core/savings";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, GoalOption, SavingsView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { TextButton } from "../components/TextButton";
import { TourAnchor } from "../howToPlay/TourAnchor";
import { useHowToPlayTour } from "../howToPlay/HowToPlayTourProvider";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Savings">;
type Phase =
  | { name: "home" }
  | { name: "deposit"; amount: number }
  | { name: "withdraw"; amount: number }
  | { name: "withdrawPreview"; amount: number; potAfter: number; days: number | null }
  | { name: "celebration" };

export default function SavingsScreen(_props: Props) {
  const { game, meta, content } = useSession();
  const tour = useHowToPlayTour();
  const [savings, setSavings] = useState<SavingsView | null>(null);
  const [goals, setGoals] = useState<GoalOption[]>([]);
  const [day, setDay] = useState<DayState | null>(null);
  const [balance, setBalance] = useState(0);
  const [phase, setPhase] = useState<Phase>({ name: "home" });
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  const [pendingFeedback, setPendingFeedback] = useState<FeedbackModel | null>(null);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    setSavings(game.savingsState(profileId));
    setGoals(game.listGoals(profileId));
    setDay(game.dayState(profileId));
    setBalance(game.getProfile(profileId).balance);
  }, [game, meta]);

  useFocusEffect(
    useCallback(() => {
      load();
      setPhase({ name: "home" });
    }, [load]),
  );

  if (!savings) {
    return (
      <Screen header={<StatusStrip />}>
        <BackButton />
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  const deposits = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return [];
    return game
      .listJournal(profileId)
      .filter((row) => row.kind === "savings_in")
      .map((row) => Math.abs(row.amount));
  };

  const goalName = (key: string) => content.goals.find((g) => g.id === key)?.name ?? key;
  const activeName = savings.activeGoal ? goalName(savings.activeGoal.key) : null;
  const accumulated = savings.activeGoal ? savings.activeGoal.cost - savings.activeGoal.remaining : 0;
  const savingsLeftover =
    day?.plan.status === "confirmed" ? day.plan.buckets.savings - day.actual.savings : null;
  const leftoverAfterDeposit =
    savingsLeftover != null && phase.name === "deposit" ? savingsLeftover - phase.amount : null;

  const putIn = (amount: number) => {
    if (tour.active) return;
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || amount <= 0) return;
    const day = game.dayState(profileId);
    const result = game.transferToSavings(profileId, day.dayId, amount);
    if (result.status === "blocked") return;
    load();
    if (result.achieved) {
      const potAfter = game.savingsState(profileId).pot;
      setPhase({ name: "celebration" });
      setPendingFeedback({
        deltas: { balance: -amount, savings: potAfter - savings.pot, mood: METERS.goalAchievedMoodBonus },
        cause: strings.feedbackCauseGoal,
        nextStep: strings.feedbackNextGoal,
      });
      return;
    }
    setPhase({ name: "home" });
    setFeedback({
      deltas: { balance: -amount, savings: amount },
      cause: strings.feedbackCauseSavingsIn,
      nextStep: strings.feedbackNextSavingsIn,
    });
  };

  const takeOut = (amount: number) => {
    if (tour.active) return;
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || amount <= 0) return;
    const day = game.dayState(profileId);
    const result = game.withdrawFromSavings(profileId, day.dayId, amount);
    if (!result.ok) return;
    load();
    setPhase({ name: "home" });
    setFeedback({
      deltas: { balance: amount, savings: -amount },
      cause: strings.feedbackCauseSavingsOut,
      nextStep: strings.feedbackNextSavingsOut,
    });
  };

  const previewWithdraw = (amount: number) => {
    const potAfter = savings.pot - amount;
    const remainingAfter = savings.activeGoal
      ? applyGoalProgress(potAfter, savings.activeGoal.cost).remaining
      : 0;
    const remainingNow = savings.activeGoal?.remaining ?? 0;
    const list = deposits();
    const before = estimateDaysToGoal(remainingNow, list);
    const after = estimateDaysToGoal(remainingAfter, list);
    const days = before != null && after != null ? Math.max(0, after - before) : null;
    setPhase({ name: "withdrawPreview", amount, potAfter, days });
  };

  const footer = (() => {
    if (feedback) return null;
    if (phase.name === "deposit") {
      return (
        <>
          <TextButton label={strings.close} onPress={() => setPhase({ name: "home" })} />
          <PrimaryButton
            label={strings.savingsDeposit}
            disabled={phase.amount <= 0}
            onPress={() => putIn(phase.amount)}
          />
        </>
      );
    }
    if (phase.name === "withdraw") {
      return (
        <>
          <TextButton label={strings.close} onPress={() => setPhase({ name: "home" })} />
          <PrimaryButton
            label={strings.savingsWithdraw}
            disabled={phase.amount <= 0}
            onPress={() => previewWithdraw(phase.amount)}
          />
        </>
      );
    }
    if (phase.name === "withdrawPreview") {
      return (
        <>
          <TextButton label={strings.close} onPress={() => setPhase({ name: "home" })} />
          <PrimaryButton label={strings.savingsConfirmWithdraw(phase.amount)} onPress={() => takeOut(phase.amount)} />
        </>
      );
    }
    if (phase.name === "home") {
      return (
        <>
          <TourAnchor id="savings-deposit">
            <PrimaryButton
              label={strings.savingsDeposit}
              disabled={balance <= 0 || tour.active}
              onPress={() => setPhase({ name: "deposit", amount: 0 })}
            />
          </TourAnchor>
          <TextButton
            label={strings.savingsWithdraw}
            disabled={savings.pot <= 0 || tour.active}
            onPress={() => setPhase({ name: "withdraw", amount: 0 })}
          />
        </>
      );
    }
    return (
      <PrimaryButton
        label={strings.gotIt}
        onPress={() => {
          setPhase({ name: "home" });
          if (pendingFeedback) {
            setFeedback(pendingFeedback);
            setPendingFeedback(null);
          }
        }}
      />
    );
  })();

  return (
    <Screen header={<StatusStrip />} footer={footer}>
      {tour.active ? null : <BackButton />}
      <Text style={styles.title}>{strings.navSavings}</Text>
      <Text style={styles.pot}>{strings.savingsPot(savings.pot)}</Text>
      {savingsLeftover != null && phase.name === "home" ? (
        <Text
          accessible
          aria-label={strings.planLeftoverA11y(strings.bucketSavings, savingsLeftover)}
          style={styles.body}
        >
          {savingsLeftover >= 0
            ? strings.planLeftover(savingsLeftover)
            : strings.planOvershoot(Math.abs(savingsLeftover))}
        </Text>
      ) : null}
      <Card>
        {savings.activeGoal && activeName ? (
          <>
            <Text style={styles.section}>{activeName}</Text>
            <Text style={styles.body}>{strings.goalRatio(accumulated, savings.activeGoal.cost)}</Text>
            <Text style={styles.body}>{strings.savingsRemaining(savings.activeGoal.remaining)}</Text>
            <Text style={styles.body}>
              {savings.estimateDays == null
                ? strings.savingsEstimateNone
                : strings.savingsEstimate(savings.estimateDays)}
            </Text>
          </>
        ) : (
          <Text style={styles.body}>{strings.savingsPickGoal}</Text>
        )}
      </Card>
      <View>
        {goals.map((goal) => {
          const name = goalName(goal.key);
          const achieved = goal.status === "achieved";
          return (
            <Chip
              key={goal.key}
              label={achieved ? `${name} (${strings.savingsAchievedBadge})` : name}
              selected={goal.isActive}
              disabled={achieved}
              onPress={() => {
                if (tour.active) return;
                const profileId = meta.get(META_KEYS.activeProfileId);
                if (!profileId) return;
                game.setActiveGoal(profileId, goal.key);
                load();
              }}
            />
          );
        })}
      </View>
      {phase.name === "deposit" ? (
        <Card>
          <AmountStepper
            label={strings.savingsDepositAmount}
            pictogram={strings.navSavingsPictogram}
            value={phase.amount}
            max={balance}
            onChange={(amount) => setPhase({ name: "deposit", amount })}
          />
          <Text style={styles.body}>{strings.savingsConfirmDeposit(phase.amount)}</Text>
          {leftoverAfterDeposit != null ? (
            <>
              <Text style={styles.body}>{strings.planAfterTap(leftoverAfterDeposit)}</Text>
              {leftoverAfterDeposit < 0 ? <Text style={styles.body}>{strings.planOverWarn}</Text> : null}
            </>
          ) : null}
        </Card>
      ) : null}
      {phase.name === "withdraw" ? (
        <Card>
          <AmountStepper
            label={strings.savingsDepositAmount}
            pictogram={strings.navSavingsPictogram}
            value={phase.amount}
            max={savings.pot}
            onChange={(amount) => setPhase({ name: "withdraw", amount })}
          />
        </Card>
      ) : null}
      {phase.name === "withdrawPreview" ? (
        <Card>
          <Text style={styles.section}>{strings.savingsConfirmWithdraw(phase.amount)}</Text>
          <Text style={styles.body}>
            {phase.days == null
              ? strings.savingsWithdrawPreviewNone(phase.potAfter)
              : strings.savingsWithdrawPreview(phase.potAfter, phase.days)}
          </Text>
        </Card>
      ) : null}
      {phase.name === "celebration" ? (
        <Card>
          <Text style={styles.section}>
            {strings.savingsConfetti} {strings.savingsAchieved}
          </Text>
        </Card>
      ) : null}
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
  pot: {
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
});
