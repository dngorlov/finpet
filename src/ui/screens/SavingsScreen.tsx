import { useCallback, useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { CatalogItemContent, GoalContent } from "../../data/content";
import { applyGoalProgress, estimateDaysToGoal } from "../../core/savings";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, SavingsView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
import { CoinText } from "../components/CoinText";
import { GlyphLabel } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { GoalPicker } from "../components/GoalPicker";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, type } from "../theme";
import { meterDeltaMap } from "../../core/economy";
import { confirmedLeftover, leftoverAfterTap } from "./planLeftover";

type Phase =
  | { name: "home" }
  | { name: "deposit"; amount: number }
  | { name: "withdraw"; amount: number }
  | { name: "withdrawPreview"; amount: number; potAfter: number; days: number | null }
  | { name: "celebration" };

function engineItem(item: Pick<CatalogItemContent, "id" | "kind" | "price" | "effect" | "also" | "once"> & { stage?: GoalContent["stage"] }) {
  return {
    id: item.id,
    kind: item.kind,
    price: item.price,
    effect: item.effect,
    also: item.also,
    once: item.once,
    stage: item.stage,
  };
}

export default function SavingsScreen() {
  const { game, meta, content } = useSession();
  const { touchChrome, focus } = usePlayChrome();
  const [savings, setSavings] = useState<SavingsView | null>(null);
  const [day, setDay] = useState<DayState | null>(null);
  const [balance, setBalance] = useState(0);
  const [phase, setPhase] = useState<Phase>({ name: "home" });
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [offerPickGoal, setOfferPickGoal] = useState(false);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    setSavings(game.savingsState(profileId));
    setDay(game.dayState(profileId));
    setBalance(game.getProfile(profileId).balance);
    touchChrome();
  }, [game, meta, touchChrome]);

  useFocusEffect(
    useCallback(() => {
      load();
      setPhase({ name: "home" });
      setOfferPickGoal(false);
    }, [load]),
  );

  useEffect(() => {
    if (focus?.kind === "goal") setPickerOpen(true);
  }, [focus]);

  if (!savings) {
    return (
      <Screen>
        <CoinText text={strings.appName} style={styles.body} />
      </Screen>
    );
  }

  if (day && !day.open) {
    return (
      <Screen>
        <ScreenTitle style={styles.title}>{strings.navSavings}</ScreenTitle>
        <CoinText text={strings.waitingEconomyHint} style={styles.body} />
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

  const goal = savings.activeGoal ? content.goals.find((item) => item.id === savings.activeGoal!.key) : undefined;
  const activeItem = goal
    ? {
        id: goal.id,
        name: goal.name,
        kind: "optional" as const,
        price: goal.price,
        effect: goal.effect,
        once: true,
        stage: goal.stage,
      }
    : null;
  const activeName = activeItem?.name ?? null;
  const accumulated = savings.activeGoal ? savings.activeGoal.cost - savings.activeGoal.remaining : 0;
  const funded = Boolean(savings.activeGoal?.achieved);
  const savingsLeftover = confirmedLeftover(day, "savings");
  const leftoverAfterDeposit =
    phase.name === "deposit" ? leftoverAfterTap(savingsLeftover, phase.amount) : null;

  const putIn = (amount: number) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || amount <= 0) return;
    const dayState = game.dayState(profileId);
    const result = game.transferToSavings(profileId, dayState.dayId, amount);
    if (result.status === "blocked") return;
    load();
    if (result.achieved) {
      setPhase({ name: "celebration" });
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
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId || amount <= 0) return;
    const dayState = game.dayState(profileId);
    const result = game.withdrawFromSavings(profileId, dayState.dayId, amount);
    if (!result.ok) return;
    load();
    setPhase({ name: "home" });
    setFeedback({
      deltas: { balance: amount, savings: -amount },
      cause: strings.feedbackCauseSavingsOut,
      nextStep: strings.feedbackNextSavingsOut,
    });
  };

  const buyFromSavings = () => {
    if (!activeItem) return;
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const dayState = game.dayState(profileId);
    const result = game.purchaseFromSavings(profileId, dayState.dayId, engineItem(activeItem));
    if (result.status === "blocked") return;
    load();
    setPhase({ name: "home" });
    setOfferPickGoal(true);
    setFeedback({
      deltas: {
        savings: -activeItem.price,
        ...meterDeltaMap(activeItem),
      },
      cause: result.stageExplanation ?? strings.feedbackCausePurchase,
      nextStep: strings.feedbackNextGoal,
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

  const openPicker = () => {
    setPickerOpen(true);
  };

  const dropGoal = () => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    game.clearActiveGoal(profileId);
    load();
    setPickerOpen(false);
    setOfferPickGoal(false);
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
    if (phase.name === "celebration") {
      return (
        <>
          <TextButton
            label={strings.savingsLater}
            onPress={() => setPhase({ name: "home" })}
          />
          <PrimaryButton
            highlighted={focus?.kind === "buy-goal"}
            label={strings.savingsBuyFromSavings}
            onPress={buyFromSavings}
          />
        </>
      );
    }
    if (phase.name === "home") {
      return (
        <>
          {offerPickGoal ? (
            <PrimaryButton label={strings.savingsChooseNewGoal} onPress={openPicker} />
          ) : null}
          {funded && !offerPickGoal ? (
            <PrimaryButton
              highlighted={focus?.kind === "buy-goal"}
              label={strings.savingsBuyFromSavings}
              onPress={buyFromSavings}
            />
          ) : null}
          <PrimaryButton
            label={strings.savingsDeposit}
            disabled={balance <= 0}
            onPress={() => setPhase({ name: "deposit", amount: 0 })}
          />
          <TextButton
            label={strings.savingsWithdraw}
            disabled={savings.pot <= 0}
            onPress={() => setPhase({ name: "withdraw", amount: 0 })}
          />
        </>
      );
    }
    return null;
  })();

  return (
    <Screen footer={footer}>
      <ScreenTitle style={styles.title}>{strings.navSavings}</ScreenTitle>
      <CoinText coin text={strings.savingsPot(savings.pot)} style={styles.pot} />
      {savingsLeftover != null && phase.name === "home" ? (
        <CoinText
          coin
          label={strings.planLeftoverA11y(strings.bucketSavings, savingsLeftover)}
          text={
            savingsLeftover >= 0
              ? strings.planLeftover(savingsLeftover)
              : strings.planOvershoot(Math.abs(savingsLeftover))
          }
          style={styles.body}
        />
      ) : null}
      <Card>
        {savings.activeGoal && activeName ? (
          <>
            <CoinText text={activeName} style={styles.section} />
            <CoinText text={strings.shopPrice(savings.activeGoal.cost)} style={styles.body} />
            <CoinText coin text={strings.goalRatio(accumulated, savings.activeGoal.cost)} style={styles.body} />
            <CoinText coin text={strings.savingsRemaining(savings.activeGoal.remaining)} style={styles.body} />
            <CoinText
              text={
                savings.estimateDays == null
                  ? strings.savingsEstimateNone
                  : strings.savingsEstimate(savings.estimateDays)
              }
              style={styles.body}
            />
          </>
        ) : (
          <CoinText text={strings.savingsPickGoal} style={styles.body} />
        )}
      </Card>
      {phase.name === "home" && !offerPickGoal ? (
        <View>
          <TextButton
            label={savings.activeGoal ? strings.savingsChooseGoal : strings.savingsPickGoal}
            onPress={openPicker}
          />
          {savings.activeGoal ? (
            <TextButton label={strings.savingsDropGoal} onPress={dropGoal} />
          ) : null}
        </View>
      ) : null}
      {phase.name === "deposit" ? (
        <Card>
          <AmountStepper
            label={strings.savingsDepositAmount}
            pictogram={strings.navSavingsPictogram}
            value={phase.amount}
            max={balance}
            onChange={(amount) => setPhase({ name: "deposit", amount })}
          />
          <CoinText coin text={strings.savingsConfirmDeposit(phase.amount)} style={styles.body} />
          {leftoverAfterDeposit != null ? (
            <>
              <CoinText coin text={strings.planAfterTap(leftoverAfterDeposit)} style={styles.body} />
              {leftoverAfterDeposit < 0 ? <CoinText text={strings.planOverWarn} style={styles.body} /> : null}
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
          <CoinText coin text={strings.savingsConfirmWithdraw(phase.amount)} style={styles.section} />
          <CoinText
            coin
            text={
              phase.days == null
                ? strings.savingsWithdrawPreviewNone(phase.potAfter)
                : strings.savingsWithdrawPreview(phase.potAfter, phase.days)
            }
            style={styles.body}
          />
        </Card>
      ) : null}
      {phase.name === "celebration" ? (
        <Card>
          <GlyphLabel glyph={strings.savingsConfetti} label={strings.savingsAchieved} labelStyle={styles.section} />
        </Card>
      ) : null}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
      <GoalPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChanged={() => {
          load();
          setOfferPickGoal(false);
        }}
      />
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
