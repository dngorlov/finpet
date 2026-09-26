import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { CatalogItemContent, GoalContent } from "../../data/content";
import { applyGoalProgress, estimateDaysToGoal } from "../../core/savings";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, JournalEntry, SavingsView } from "../../data/repositories/gameRepository";
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
import { moneyStrings } from "../stringsMoney";
import { colors, spacing, type } from "../theme";
import { meterDeltaMap } from "../../core/economy";
import { itemLookup, savingsOps, savingsStats } from "./journalStats";
import {
  ActionRow,
  Amount,
  HeroCard,
  MoneyCard,
  moneyColors,
  OpRow,
  ProgressBar,
  RoundAction,
  SectionTitle,
  StatTile,
  TileRow,
} from "./moneyParts";
import { confirmedLeftover, leftoverAfterTap } from "./planLeftover";

/** Rows in the Копилка history. */
const RECENT_OPS = 6;

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
  const [journal, setJournal] = useState<JournalEntry[]>([]);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    setSavings(game.savingsState(profileId));
    setDay(game.dayState(profileId));
    setBalance(game.getProfile(profileId).balance);
    setJournal(game.listJournal(profileId));
    touchChrome();
  }, [game, meta, touchChrome]);

  useFocusEffect(
    useCallback(() => {
      load();
      setPhase({ name: "home" });
      setOfferPickGoal(false);
    }, [load]),
  );

  const [seenFocus, setSeenFocus] = useState<typeof focus>(null);
  if (focus !== seenFocus) {
    setSeenFocus(focus);
    if (focus?.kind === "goal") setPickerOpen(true);
  }

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

  const deposits = () =>
    journal.filter((row) => row.kind === "savings_in").map((row) => Math.abs(row.amount));

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
      if (offerPickGoal) return <PrimaryButton label={strings.savingsChooseNewGoal} onPress={openPicker} />;
      if (funded) {
        return (
          <PrimaryButton
            highlighted={focus?.kind === "buy-goal"}
            label={strings.savingsBuyFromSavings}
            onPress={buyFromSavings}
          />
        );
      }
    }
    return null;
  })();

  const lookup = itemLookup(content.catalog, content.goals);
  const ops = savingsOps(journal, lookup).slice(0, RECENT_OPS);
  const stats = savingsStats(journal);
  const goalCost = savings.activeGoal?.cost ?? 0;
  const home = phase.name === "home";
  const itemName = (id: string | null) => content.goals.find((entry) => entry.id === id)?.name ?? id ?? "";

  return (
    <Screen footer={footer}>
      <ScreenTitle style={styles.title}>{strings.navSavings}</ScreenTitle>
      {savingsLeftover != null && home ? (
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
      <HeroCard caption={moneyStrings.savingsCaption} value={savings.pot} label={strings.savingsPot(savings.pot)}>
        <View style={styles.heroDivider} />
        {savings.activeGoal && activeName ? (
          <>
            <View style={styles.heroRow}>
              <View style={styles.heroGoal}>
                <Text style={styles.heroSmall}>{moneyStrings.savingsGoalCaption}</Text>
                <Text style={styles.heroGoalName}>{activeName}</Text>
              </View>
              <View accessible aria-label={strings.shopPrice(goalCost)}>
                <Amount value={goalCost} size={16} color={moneyColors.heroText} />
              </View>
            </View>
            <View accessible aria-label={moneyStrings.savingsGoalProgress(accumulated, goalCost)}>
              <ProgressBar value={accumulated} max={goalCost} on="hero" />
            </View>
            <View style={styles.heroRow}>
              <Text style={styles.heroValue}>{strings.goalRatio(accumulated, goalCost)}</Text>
              <Text style={styles.heroValue}>{strings.savingsRemaining(savings.activeGoal.remaining)}</Text>
            </View>
            <View style={styles.heroRow}>
              <Text style={styles.heroSmall}>{moneyStrings.savingsForecast}</Text>
              <Text style={styles.heroValue}>
                {savings.estimateDays == null
                  ? strings.savingsEstimateNone
                  : strings.savingsEstimate(savings.estimateDays)}
              </Text>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.heroSmall}>{moneyStrings.savingsNoGoal}</Text>
            <Text style={styles.heroGoalName}>{strings.savingsPickGoal}</Text>
          </>
        )}
      </HeroCard>
      {home && !offerPickGoal ? (
        <ActionRow>
          <RoundAction
            label={strings.savingsDeposit}
            icon="arrow-down"
            disabled={balance <= 0}
            onPress={() => setPhase({ name: "deposit", amount: 0 })}
          />
          <RoundAction
            label={strings.savingsWithdraw}
            icon="arrow-up"
            disabled={savings.pot <= 0}
            onPress={() => setPhase({ name: "withdraw", amount: 0 })}
          />
          <RoundAction
            label={moneyStrings.actionGoal}
            icon="target"
            highlighted={focus?.kind === "goal"}
            onPress={openPicker}
          />
        </ActionRow>
      ) : null}
      {home && !offerPickGoal && savings.activeGoal ? (
        <TextButton label={strings.savingsDropGoal} onPress={dropGoal} />
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
      {home ? (
        <>
          <TileRow>
            <StatTile
              label={moneyStrings.statTotal}
              value={stats.total}
              spoken={moneyStrings.statA11y(moneyStrings.statTotal, stats.total)}
            />
            <StatTile
              label={moneyStrings.statCount}
              value={stats.count}
              coin={false}
              spoken={moneyStrings.statCountA11y(stats.count)}
            />
            <StatTile
              label={moneyStrings.statAverage}
              value={stats.average}
              spoken={moneyStrings.statA11y(moneyStrings.statAverage, stats.average)}
            />
          </TileRow>
          <SectionTitle>{moneyStrings.savingsHistory}</SectionTitle>
          <MoneyCard tight>
            {ops.length === 0 ? <Text style={styles.empty}>{moneyStrings.savingsHistoryEmpty}</Text> : null}
            {ops.map((op, index) => {
              const title =
                op.kind === "in"
                  ? moneyStrings.opIn
                  : op.kind === "out"
                    ? moneyStrings.opOut
                    : moneyStrings.opGoal(itemName(op.itemId));
              const day = moneyStrings.day(op.dayN);
              return (
                <OpRow
                  key={op.id}
                  icon={op.kind === "in" ? "arrow-down" : op.kind === "out" ? "arrow-up" : "star"}
                  tint={op.kind === "in" ? moneyColors.plus : op.kind === "out" ? colors.raisedEdge : moneyColors.goal}
                  title={title}
                  subtitle={day}
                  amount={op.amount}
                  label={moneyStrings.opRowA11y(title, day, op.amount)}
                  last={index === ops.length - 1}
                />
              );
            })}
          </MoneyCard>
        </>
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
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  empty: {
    color: colors.subtle,
    fontSize: type.body,
    paddingVertical: spacing.s,
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
  heroGoal: {
    flex: 1,
    gap: 2,
  },
  heroSmall: {
    color: moneyColors.heroSubtle,
    fontSize: 14,
  },
  heroGoalName: {
    color: moneyColors.heroText,
    fontSize: type.section,
    fontWeight: "700",
  },
  heroValue: {
    color: moneyColors.heroText,
    fontSize: type.body,
    fontWeight: "700",
  },
});
