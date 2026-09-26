import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { sortVerdict, type SortItem, type Verdict } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { gameStrings } from "./gameStrings";
import { gameStyles, VerdictBanner, VERDICT_TINT } from "./GameParts";

const ZONE_TINTS = [
  { fill: "#FFF1DC", edge: colors.raisedEdge },
  { fill: "#EEF6CF", edge: "#6B7A00" },
];

/**
 * «Нужно или хочется?»: chips on top, baskets below. Tap a chip, then a
 * basket (drag-free so it works with one thumb and with TalkBack). A right
 * basket keeps the chip there; a wrong one explains and returns the chip.
 * «Подтвердить» appears when every chip is placed.
 */
export function SortBoard({
  bins,
  items,
  withPet,
  onAnswer,
  onDone,
}: {
  bins: readonly string[];
  items: readonly SortItem[];
  withPet: (text: string) => string;
  /** First try per item is the score; later tries are practice. */
  onAnswer: (index: number, verdict: Verdict) => void;
  onDone: () => void;
}) {
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ verdict: Verdict; text: string } | null>(null);

  const pool = items.map((item, index) => ({ item, index })).filter(({ index }) => placed[index] === undefined);

  const drop = (bin: number) => {
    if (selected === null) {
      setBanner({ verdict: "warn", text: gameStrings.sortPickFirst });
      return;
    }
    const item = items[selected];
    if (!item) return;
    const verdict = sortVerdict(item, bin);
    onAnswer(selected, verdict);
    if (verdict === "good") {
      setPlaced((current) => ({ ...current, [selected]: bin }));
      setBanner({ verdict, text: withPet(item.explanation) });
    } else {
      setBanner({ verdict, text: withPet(item.hint ?? gameStrings.sortHintDefault) });
    }
    setSelected(null);
  };

  return (
    <View style={styles.root}>
      <Text style={gameStyles.body}>{gameStrings.sortLeft(pool.length)}</Text>
      <View style={styles.pool}>
        {pool.map(({ item, index }) => {
          const on = selected === index;
          return (
            <Pressable
              key={`${item.label}-${index}`}
              role="button"
              aria-label={withPet(item.label)}
              aria-selected={on}
              onPress={() => {
                setSelected(on ? null : index);
                setBanner(null);
              }}
              style={[styles.chip, on ? styles.chipOn : null]}
            >
              {item.icon ? (
                <Text aria-hidden style={styles.chipIcon}>
                  {item.icon}
                </Text>
              ) : null}
              <Text style={styles.chipLabel}>{withPet(item.label)}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.zones}>
        {bins.map((bin, binIndex) => {
          const inside = items.map((item, index) => ({ item, index })).filter(({ index }) => placed[index] === binIndex);
          const tint = ZONE_TINTS[binIndex % ZONE_TINTS.length]!;
          const ready = selected !== null;
          return (
            <Pressable
              key={bin}
              role="button"
              aria-label={gameStrings.sortZoneA11y(bin, inside.length)}
              onPress={() => drop(binIndex)}
              style={[
                styles.zone,
                { backgroundColor: tint.fill, borderColor: tint.edge },
                ready ? styles.zoneReady : null,
              ]}
            >
              <Text style={[styles.zoneTitle, { color: tint.edge }]}>{bin}</Text>
              <View style={styles.zoneItems}>
                {inside.map(({ item, index }) => (
                  <View key={index} style={styles.placed}>
                    <Text aria-hidden style={styles.placedText}>
                      {item.icon ? `${item.icon} ` : ""}
                      {withPet(item.label)}
                    </Text>
                  </View>
                ))}
              </View>
            </Pressable>
          );
        })}
      </View>
      {banner ? (
        <VerdictBanner
          verdict={banner.verdict}
          title={banner.verdict === "good" ? gameStrings.sortRight : banner.verdict === "bad" ? gameStrings.sortWrong : undefined}
          text={banner.text}
        />
      ) : null}
      {pool.length === 0 ? <PrimaryButton label={gameStrings.confirm} onPress={onDone} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
  },
  pool: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.disabledFace,
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: "row",
    gap: 6,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  chipOn: {
    backgroundColor: colors.highlight,
    borderColor: colors.raisedEdge,
    borderWidth: 3,
    transform: [{ scale: 1.06 }],
  },
  chipIcon: {
    fontSize: 22,
  },
  chipLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  zones: {
    flexDirection: "row",
    gap: spacing.s,
  },
  zone: {
    borderRadius: radius.card,
    borderStyle: "dashed",
    borderWidth: 3,
    flex: 1,
    gap: spacing.s,
    minHeight: 150,
    padding: spacing.s,
  },
  zoneReady: {
    borderStyle: "solid",
  },
  zoneTitle: {
    fontSize: type.section,
    fontWeight: "800",
    textAlign: "center",
  },
  zoneItems: {
    gap: 4,
  },
  placed: {
    backgroundColor: colors.card,
    borderColor: VERDICT_TINT.good.edge,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  placedText: {
    color: colors.text,
    fontSize: 14,
  },
});
