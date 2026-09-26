import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SceneTile, TaskOption, Verdict } from "../../core/tasks";
import { CoinText } from "../components/CoinText";
import { Pictogram } from "../components/Pictogram";
import { strings } from "../strings";
import { colors, font, minTarget, radius, spacing, type } from "../theme";

const hidden = {
  "aria-hidden": true as const,
  accessibilityElementsHidden: true as const,
  importantForAccessibility: "no-hide-descendants" as const,
};

export const VERDICT_TINT: Record<Verdict, { fill: string; edge: string }> = {
  good: { fill: "#E6F2B8", edge: "#6B7A00" },
  warn: { fill: "#FFE9C7", edge: "#855400" },
  bad: { fill: "#FFDAD4", edge: "#BA1A1A" },
};

/** «✅ Верно» strip with the why-line — the Duolingo answer bar. */
export function VerdictBanner({ verdict, text, title }: { verdict: Verdict; text: string; title?: string }) {
  const tint = VERDICT_TINT[verdict];
  const label = title ?? strings.verdictLabel(verdict);
  return (
    <View
      accessible
      role="status"
      aria-label={label}
      style={[styles.banner, { backgroundColor: tint.fill, borderColor: tint.edge }]}
    >
      <View style={styles.bannerTitle}>
        <Pictogram glyph={strings.verdictGlyph(verdict)} color={tint.edge} />
        <Text style={[styles.bannerHead, { color: tint.edge }]}>{label}</Text>
      </View>
      <CoinText text={text} style={styles.body} />
    </View>
  );
}

/** Neutral info strip (consequence lines of games without right/wrong). */
export function InfoBanner({ text, tone = "plain" }: { text: string; tone?: "plain" | "good" | "warn" }) {
  const fill = tone === "good" ? VERDICT_TINT.good.fill : tone === "warn" ? VERDICT_TINT.warn.fill : colors.highlight;
  return (
    <View accessible role="status" aria-label={text} style={[styles.info, { backgroundColor: fill }]}>
      <CoinText labelled={false} text={text} style={styles.body} />
    </View>
  );
}

export function ProgressBar({ value, max, color = colors.fill }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return (
    <View {...hidden} style={styles.track}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}

/** Picture tiles above a question: product + price tag, cash desk, wallet. */
export function SceneTiles({ tiles }: { tiles: readonly SceneTile[] }) {
  return (
    <View style={styles.tiles}>
      {tiles.map((tile, index) => {
        const spoken = [tile.label, tile.was ? `было ${tile.was}` : null, tile.value, tile.sticker]
          .filter(Boolean)
          .join(", ");
        return (
          <View
            key={`${tile.label}-${index}`}
            accessible
            aria-label={spoken}
            style={[
              styles.tile,
              tile.tone === "warn" ? styles.tileWarn : tile.tone === "good" ? styles.tileGood : null,
              tiles.length === 1 ? styles.tileWide : null,
            ]}
          >
            {tile.sticker ? (
              <View {...hidden} style={styles.sticker}>
                <Text style={styles.stickerText}>{tile.sticker}</Text>
              </View>
            ) : null}
            {tile.icon ? (
              <Text {...hidden} style={tiles.length === 1 ? styles.iconHuge : styles.icon}>
                {tile.icon}
              </Text>
            ) : null}
            <Text {...hidden} style={styles.tileLabel}>
              {tile.label}
            </Text>
            <View {...hidden} style={styles.priceRow}>
              {tile.was ? <Text style={styles.was}>{tile.was}</Text> : null}
              {tile.value ? <Text style={styles.value}>{tile.value}</Text> : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

/** Answer options as big picture tiles (Что дешевле?, Да/Нет, Платить/Проверить). */
export function OptionTiles({
  options,
  onChoose,
  withPet,
}: {
  options: readonly TaskOption[];
  onChoose: (index: number) => void;
  withPet: (text: string) => string;
}) {
  return (
    <View style={styles.tiles}>
      {options.map((option, index) => (
        <Pressable
          key={`${option.label}-${index}`}
          role="button"
          aria-label={withPet(option.label)}
          accessibilityHint={option.hint}
          onPress={() => onChoose(index)}
          style={styles.optionHit}
        >
          {({ pressed }) => (
            <View style={[styles.optionShell, pressed ? styles.optionPressed : null]}>
              <View style={styles.optionFace}>
                {option.icon ? (
                  <Text {...hidden} style={styles.icon}>
                    {option.icon}
                  </Text>
                ) : null}
                <Text {...hidden} style={styles.optionLabel}>
                  {withPet(option.label)}
                </Text>
                {option.hint ? (
                  <Text {...hidden} style={styles.optionHint}>
                    {option.hint}
                  </Text>
                ) : null}
              </View>
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

export const gameStyles = StyleSheet.create({
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  pixel: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
  },
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.m,
  },
});

const styles = StyleSheet.create({
  body: gameStyles.body,
  banner: {
    borderRadius: radius.card,
    borderWidth: 2,
    gap: spacing.s,
    padding: spacing.m,
  },
  bannerTitle: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  bannerHead: {
    fontSize: type.section,
    fontWeight: "800",
  },
  info: {
    borderRadius: radius.card,
    padding: spacing.m,
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: 8,
    height: 16,
    overflow: "hidden",
  },
  fill: {
    borderRadius: 8,
    height: 16,
  },
  tiles: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
  },
  tile: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 16,
    borderWidth: 2,
    gap: 2,
    minWidth: 96,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
  },
  tileWide: {
    minWidth: 200,
    paddingVertical: spacing.m,
  },
  tileWarn: {
    backgroundColor: VERDICT_TINT.bad.fill,
    borderColor: VERDICT_TINT.bad.edge,
  },
  tileGood: {
    backgroundColor: VERDICT_TINT.good.fill,
    borderColor: VERDICT_TINT.good.edge,
  },
  sticker: {
    backgroundColor: "#BA1A1A",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ rotate: "-6deg" }],
  },
  stickerText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "800",
  },
  icon: {
    fontSize: 36,
  },
  iconHuge: {
    fontSize: 64,
  },
  tileLabel: {
    color: colors.subtle,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  priceRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  was: {
    color: colors.subtle,
    fontFamily: font.pixel,
    fontSize: 12,
    textDecorationLine: "line-through",
  },
  value: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
  },
  optionHit: {
    flexBasis: "45%",
    flexGrow: 1,
    minHeight: minTarget,
  },
  optionShell: {
    backgroundColor: colors.raisedEdge,
    borderRadius: 16,
    paddingBottom: 5,
  },
  optionPressed: {
    paddingBottom: 0,
    paddingTop: 5,
  },
  optionFace: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.accent,
    borderRadius: 16,
    borderWidth: 2,
    gap: 4,
    minHeight: 96,
    justifyContent: "center",
    padding: spacing.s,
  },
  optionLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
    textAlign: "center",
  },
  optionHint: {
    color: colors.accentText,
    fontFamily: font.pixel,
    fontSize: 12,
    textAlign: "center",
  },
});
