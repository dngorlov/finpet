import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { CatalogItemContent } from "../../data/content";
import { applyGoalProgress, estimateDaysToGoal } from "../../core/savings";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, SavingsView } from "../../data/repositories/gameRepository";
import { AmountStepper } from "../components/AmountStepper";
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

function engineItem(item: CatalogItemContent) {
  return { id: item.id, kind: item.kind, price: item.price, effect: item.effect, also: item.also, once: item.once };
}

export default function SavingsScreen() {
  const { game, meta, content } = useSession();
  const { touchChrome } = usePlayChrome();
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
      setPickerOpen(false);
      setOfferPickGoal(false);
    }, [load]),
  );

  if (!savings) {
    return (
      <Screen>
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  if (day && !day.open) {
    return (
      <Screen>
        <ScreenTitle style={styles.title}>{strings.navSavings}</ScreenTitle>
        <Text style={styles.body}>{strings.waitingEconomyHint}</Text>
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

  const activeItem = savings.activeGoal
    ? content.catalog.find((item) => item.id === savings.activeGoal!.key) ?? null
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
      cause: strings.feedbackCausePurchase,
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
          <PrimaryButton label={strings.savingsBuyFromSavings} onPress={buyFromSavings} />
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
            <Text style={styles.body}>{strings.shopPrice(savings.activeGoal.cost)}</Text>
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
