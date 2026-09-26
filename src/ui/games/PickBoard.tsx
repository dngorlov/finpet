import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { purseFilled, PURSE_PIPS, type ShopPose } from "../../core/shopPlay";
import { matchPick, pickBudget, tileCoins, type SceneTile, type TaskOption } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, spacing, type } from "../theme";
import { gameStrings } from "./gameStrings";
import { SceneTiles } from "./GameParts";

/**
 * «Что купить в первую очередь?»: tap the product cards, then «Купить».
 * The wallet tile stays put and shows how much there is to spend.
 */
export function PickBoard({
  tiles,
  options,
  onChoose,
  returned,
  onPose,
}: {
  tiles: readonly SceneTile[];
  options: readonly TaskOption[];
  onChoose: (optionIndex: number) => void;
  /** The last buy was handed back, so the shop is open again. */
  returned?: boolean;
  onPose?: (pose: ShopPose) => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const budget = pickBudget(tiles);
  const spent = tiles.filter((tile) => selected.includes(tile.label)).reduce((sum, tile) => sum + tileCoins(tile), 0);
  const over = budget != null && spent > budget;
  const left = Math.max(0, (budget ?? spent) - spent);
  const line =
    selected.length === 0
      ? gameStrings.pickHint
      : over && budget != null
        ? gameStrings.pickOver(spent, budget)
        : gameStrings.pickSum(spent, left);
  const purseLine =
    budget == null ? null : over ? gameStrings.purseOver : gameStrings.purse(left, budget);
  const filled = budget == null ? 0 : purseFilled(budget, spent);

  const toggle = (label: string) => {
    const next = selected.includes(label) ? selected.filter((item) => item !== label) : [...selected, label];
    const nextSpent = tiles.filter((tile) => next.includes(tile.label)).reduce((sum, tile) => sum + tileCoins(tile), 0);
    setSelected(next);
    onPose?.(budget != null && nextSpent > budget ? "sad" : next.length > 0 ? "happy" : "idle");
  };

  const buy = () => {
    const index = matchPick(options, selected);
    if (index >= 0) onChoose(index);
  };

  return (
    <View style={styles.root}>
      {returned ? <Text style={styles.line}>{gameStrings.pickReturned}</Text> : null}
      {purseLine ? (
        <View accessible aria-label={purseLine} style={styles.purse}>
          <Text aria-hidden style={styles.pips}>
            {"●".repeat(filled)}
            {"○".repeat(PURSE_PIPS - filled)}
          </Text>
          <Text aria-hidden style={[styles.line, over ? styles.over : null]}>
            {purseLine}
          </Text>
        </View>
      ) : null}
      <SceneTiles
        tiles={tiles}
        selected={new Set(selected)}
        onToggle={toggle}
        bounce={over ? selected[selected.length - 1] : undefined}
      />
      <Text style={[styles.line, over ? styles.over : null]}>{line}</Text>
      <PrimaryButton label={gameStrings.pickBuy} disabled={selected.length === 0 || over} onPress={buy} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.s,
  },
  line: {
    color: colors.text,
    fontSize: type.body,
    textAlign: "center",
  },
  over: {
    color: colors.accentText,
  },
  purse: {
    alignItems: "center",
    gap: spacing.s,
  },
  pips: {
    color: colors.raisedEdge,
    fontSize: 18,
    letterSpacing: 2,
  },
});
