import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { roundsToGoal } from "../../core/budgetGames";
import type { ShopPose } from "../../core/shopPlay";
import type { SavingGoal, Temptation } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { strings } from "../strings";
import { colors, font, minTarget, radius, spacing, type } from "../theme";
import { gameStrings } from "./gameStrings";
import { gameStyles, InfoBanner, ProgressBar } from "./GameParts";

function GoalCard({ goal, saved }: { goal: SavingGoal; saved: number }) {
  const shown = Math.min(saved, goal.price);
  return (
    <View
      accessible
      aria-label={`${goal.name}. ${gameStrings.progress(shown, goal.price)}. ${gameStrings.remaining(Math.max(0, goal.price - saved))}`}
      style={styles.goal}
    >
      <Text aria-hidden style={styles.goalIcon}>
        {goal.icon}
      </Text>
      <View style={styles.goalText}>
        <Text aria-hidden style={gameStyles.section}>
          {goal.name}
        </Text>
        <ProgressBar value={shown} max={goal.price} />
        <View aria-hidden style={styles.goalNumbers}>
          <Text style={gameStyles.body}>{gameStrings.progress(shown, goal.price)}</Text>
          <Text style={gameStyles.body}>{gameStrings.remaining(Math.max(0, goal.price - saved))}</Text>
        </View>
      </View>
    </View>
  );
}

function AmountChips({
  amounts,
  max,
  label,
  onPick,
  selected,
}: {
  amounts: readonly number[];
  max?: number;
  label: (n: number) => string;
  onPick: (n: number) => void;
  selected?: number | null;
}) {
  return (
    <View style={styles.chips}>
      {amounts.map((n) => {
        const off = max != null && n > max;
        const on = selected === n;
        return (
          <Pressable
            key={n}
            role="button"
            aria-label={label(n)}
            aria-disabled={off}
            aria-selected={on}
            disabled={off}
            onPress={() => onPick(n)}
            style={({ pressed }) => [styles.coinBtn, off ? styles.coinOff : null, on ? styles.coinOn : null, pressed ? styles.coinPressed : null]}
          >
            <Text aria-hidden style={[styles.coinText, off ? styles.coinTextOff : null]}>
              +{n}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * Шаг за шагом: each round coins come in, the child picks how many to put
 * away; sometimes a want tempts the pet. Ends when the goal is reached.
 */
export function StepsGame({
  goal,
  saved: start,
  amounts,
  income,
  temptations = [],
  petName,
  onDone,
  onPose,
}: {
  goal: SavingGoal;
  saved: number;
  amounts: readonly number[];
  income: number;
  temptations?: readonly Temptation[];
  petName: string;
  onDone: () => void;
  onPose?: (pose: ShopPose) => void;
}) {
  const [saved, setSaved] = useState(start);
  const [round, setRound] = useState(1);
  const [available, setAvailable] = useState(income);
  const [tempted, setTempted] = useState<Set<number>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const temptation = temptations.find((t) => t.round === round && !tempted.has(t.round));
  const reached = saved >= goal.price;

  const nextRound = () => {
    setRound((r) => r + 1);
    setAvailable(income);
  };
  const put = (n: number) => {
    const next = saved + n;
    setSaved(next);
    const left = Math.max(0, goal.price - next);
    setMessage(`${gameStrings.putResult(n, left)}${n <= amounts[0]! && left > 0 ? ` ${gameStrings.smallStep}` : ""}`);
    onPose?.("happy");
    nextRound();
  };

  return (
    <View style={styles.root}>
      <GoalCard goal={goal} saved={saved} />
      {message ? <InfoBanner tone="good" text={message} /> : null}
      {reached ? (
        <>
          <InfoBanner tone="good" text={gameStrings.reached(goal.price)} />
          <PrimaryButton label={strings.next} onPress={onDone} />
        </>
      ) : temptation ? (
        <View style={styles.visitor}>
          <Text style={styles.visitorKicker}>{gameStrings.visitorHere}</Text>
          <View style={styles.speech}>
            <Text aria-hidden style={styles.temptIcon}>
              {temptation.icon}
            </Text>
            <Text style={gameStyles.section}>{gameStrings.tempt(petName, temptation.name, temptation.price)}</Text>
          </View>
          <PrimaryButton
            label={gameStrings.temptBuy}
            onPress={() => {
              const left = Math.max(0, available - temptation.price);
              setAvailable(left);
              setTempted((s) => new Set(s).add(temptation.round));
              setMessage(left > 0 ? gameStrings.temptBought(temptation.name, temptation.price, left) : gameStrings.temptBoughtNothing(temptation.name));
              onPose?.("sad");
            }}
          />
          <PrimaryButton
            label={gameStrings.temptKeep}
            onPress={() => {
              setTempted((s) => new Set(s).add(temptation.round));
              setMessage(gameStrings.temptKept);
              onPose?.("happy");
            }}
          />
        </View>
      ) : (
        <View style={gameStyles.panel}>
          <Text style={gameStyles.section}>{gameStrings.income(available)}</Text>
          <AmountChips amounts={amounts} max={available} label={gameStrings.put} onPick={put} />
          {amounts.every((n) => n > available) ? (
            <PrimaryButton
              label={gameStrings.skipRound}
              onPress={() => {
                setMessage(null);
                nextRound();
              }}
            />
          ) : null}
        </View>
      )}
    </View>
  );
}

/**
 * Финансовая мечта: pick a dream, make the first deposit, then check if a
 * daily pace gets there in time (change it and see the answer right away).
 */
export function DreamGame({
  goals,
  saved,
  amounts,
  days,
  onDone,
}: {
  goals: readonly SavingGoal[];
  saved: number;
  amounts: readonly number[];
  days?: number;
  onDone: () => void;
}) {
  const [goal, setGoal] = useState<SavingGoal | null>(null);
  const [added, setAdded] = useState<number | null>(null);
  const [pace, setPace] = useState<number | null>(null);

  if (!goal) {
    return (
      <View style={styles.dreams}>
        {goals.map((g) => (
          <Pressable
            key={g.name}
            role="button"
            aria-label={gameStrings.dreamPickA11y(g.name, g.price)}
            onPress={() => setGoal(g)}
            style={({ pressed }) => [styles.dream, pressed ? styles.coinPressed : null]}
          >
            <Text aria-hidden style={styles.dreamIcon}>
              {g.icon}
            </Text>
            <Text aria-hidden style={styles.dreamName}>
              {g.name}
            </Text>
            <Text aria-hidden style={styles.dreamPrice}>
              {g.price}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const total = saved + (added ?? 0);
  const left = Math.max(0, goal.price - total);
  const needDays = pace ? roundsToGoal(total, goal.price, pace) : null;
  return (
    <View style={styles.root}>
      <Text style={gameStyles.body}>{gameStrings.dreamGoal(goal.name, goal.price)}</Text>
      <GoalCard goal={goal} saved={total} />
      {added === null ? (
        <View style={gameStyles.panel}>
          <Text style={gameStyles.section}>{gameStrings.dreamDeposit}</Text>
          <AmountChips amounts={amounts} label={gameStrings.dreamAdd} onPick={setAdded} />
        </View>
      ) : (
        <>
          <InfoBanner tone="good" text={gameStrings.dreamAdded(added, left)} />
          {days && left > 0 ? (
            <View style={gameStyles.panel}>
              <Text style={gameStyles.section}>{gameStrings.dreamPace(days)}</Text>
              <AmountChips amounts={amounts} label={gameStrings.dreamPer} onPick={setPace} selected={pace} />
              {pace && needDays !== null ? (
                <InfoBanner tone={needDays <= days ? "good" : "warn"} text={gameStrings.dreamPaceResult(pace, needDays, days)} />
              ) : null}
            </View>
          ) : null}
          {!days || left === 0 || pace !== null ? <PrimaryButton label={strings.next} onPress={onDone} /> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
  },
  goal: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.m,
    padding: spacing.m,
  },
  goalIcon: {
    fontSize: 48,
  },
  goalText: {
    flex: 1,
    gap: 6,
  },
  goalNumbers: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  chips: {
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
  },
  coinBtn: {
    alignItems: "center",
    backgroundColor: "#F7C948",
    borderColor: colors.raisedEdge,
    borderRadius: 36,
    borderWidth: 3,
    height: 72,
    justifyContent: "center",
    width: 72,
  },
  coinOn: {
    backgroundColor: colors.fill,
  },
  coinOff: {
    backgroundColor: colors.track,
    borderColor: colors.disabledFace,
  },
  coinPressed: {
    transform: [{ scale: 0.95 }],
  },
  coinText: {
    color: colors.onRaised,
    fontFamily: font.pixel,
    fontSize: 16,
  },
  coinTextOff: {
    color: colors.subtle,
  },
  temptIcon: {
    fontSize: 48,
    textAlign: "center",
  },
  visitor: {
    gap: spacing.s,
  },
  visitorKicker: {
    color: colors.accentText,
    fontSize: type.body,
    fontWeight: "800",
    textAlign: "center",
  },
  speech: {
    backgroundColor: colors.highlight,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.m,
  },
  dreams: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
  },
  dream: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderRadius: radius.card,
    borderWidth: 3,
    gap: 4,
    minHeight: minTarget,
    padding: spacing.m,
    width: "46%",
  },
  dreamIcon: {
    fontSize: 48,
  },
  dreamName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
    textAlign: "center",
  },
  dreamPrice: {
    color: colors.accentText,
    fontFamily: font.pixel,
    fontSize: 14,
  },
});
