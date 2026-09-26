import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { PixelIcon } from "../components/Pictogram";
import { PixelSprite } from "../components/PixelSprite";
import type { PixelIconName } from "../pixelIconXml";
import { moneyStrings } from "../stringsMoney";
import { colors, font, minTarget, radius, spacing, type } from "../theme";

/** Bank-app look shared by Копилка, План, Журнал and Банк. */
export const moneyColors = {
  /** Account card: dark primary with light text (white on #855400 is 6:1). */
  heroFace: colors.raisedEdge,
  heroText: "#FFFFFF",
  heroSubtle: colors.highlight,
  heroTrack: "#A66F1C",
  /** Money in (≥4.5:1 on white). */
  plus: "#4F5B00",
  minus: colors.text,
  goal: "#8C4A60",
  free: colors.disabledFace,
} as const;

/** Amount in the pixel face with the coin sprite. */
export function Amount({
  value,
  signed,
  size = 16,
  color = colors.text,
}: {
  value: number;
  signed?: boolean;
  size?: number;
  color?: string;
}) {
  const text = signed ? moneyStrings.signed(value) : String(value);
  return (
    <View style={styles.amount}>
      <Text style={[styles.pixel, { color, fontSize: size, lineHeight: Math.round(size * 1.5) }]}>{text}</Text>
      <PixelSprite name="coin" size={Math.max(16, Math.round(size * 1.1))} />
    </View>
  );
}

/** The account-card hero at the top of a section. */
export function HeroCard({
  caption,
  value,
  label,
  children,
}: {
  caption: string;
  value: number;
  /** Spoken amount line. */
  label: string;
  children?: ReactNode;
}) {
  return (
    <View style={styles.hero}>
      <Text style={styles.heroCaption}>{caption}</Text>
      <View accessible aria-label={label}>
        <Amount value={value} size={32} color={moneyColors.heroText} />
      </View>
      {children}
    </View>
  );
}

/** Thin progress bar; `on` picks the hero or the card colors. */
export function ProgressBar({
  value,
  max,
  on = "card",
  color = colors.fill,
}: {
  value: number;
  max: number;
  on?: "hero" | "card";
  color?: string;
}) {
  const share = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  return (
    <View
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.bar, { backgroundColor: on === "hero" ? moneyColors.heroTrack : colors.track }]}
    >
      <View style={[styles.barFill, { backgroundColor: color, width: `${share * 100}%` }]} />
    </View>
  );
}

/** Small stat tile: caption on top, pixel number below. */
export function StatTile({ label, value, spoken, coin = true }: { label: string; value: number; spoken: string; coin?: boolean }) {
  return (
    <View accessible aria-label={spoken} style={styles.tile}>
      <Text style={styles.tileLabel} numberOfLines={2}>
        {label}
      </Text>
      {coin ? <Amount value={value} size={16} /> : <Text style={[styles.pixel, styles.tileNumber]}>{value}</Text>}
    </View>
  );
}

export function TileRow({ children }: { children: ReactNode }) {
  return <View style={styles.tileRow}>{children}</View>;
}

export function SectionTitle({ children }: { children: string }) {
  return (
    <Text role="heading" style={styles.sectionTitle}>
      {children}
    </Text>
  );
}

/** Round quick action with a caption under it (Положить / Забрать / Цель). */
export function RoundAction({
  label,
  icon,
  onPress,
  disabled,
  highlighted,
}: {
  label: string;
  icon: PixelIconName;
  onPress: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={Boolean(disabled)}
      aria-selected={highlighted ? true : undefined}
      disabled={disabled}
      onPress={onPress}
      style={styles.action}
    >
      {({ pressed }) => (
        <>
          <View style={[styles.actionEdge, disabled ? styles.actionEdgeOff : null, pressed && !disabled ? styles.actionPressed : null]}>
            <View
              style={[
                styles.actionFace,
                disabled ? styles.actionFaceOff : null,
                highlighted ? styles.actionFaceMarked : null,
              ]}
            >
              <PixelIcon name={icon} size={28} color={disabled ? colors.subtle : colors.onRaised} />
            </View>
          </View>
          <Text aria-hidden style={[styles.actionCaption, disabled ? styles.actionCaptionOff : null]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function ActionRow({ children }: { children: ReactNode }) {
  return <View style={styles.actionRow}>{children}</View>;
}

/** Bank-statement row: icon in a circle, title and subtitle, amount on the right. */
export function OpRow({
  icon,
  tint,
  title,
  subtitle,
  amount,
  label,
  last,
}: {
  icon: PixelIconName;
  tint: string;
  title: string;
  subtitle?: string;
  amount: number;
  label: string;
  last?: boolean;
}) {
  const color = amount > 0 ? moneyColors.plus : amount < 0 ? moneyColors.minus : colors.subtle;
  return (
    <View accessible aria-label={label} style={[styles.op, last ? null : styles.opDivider]}>
      <View style={styles.opIcon}>
        <PixelIcon name={icon} size={24} color={tint} />
      </View>
      <View style={styles.opText}>
        <Text style={styles.opTitle} numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.opSubtitle}>{subtitle}</Text> : null}
      </View>
      <Amount value={amount} signed size={14} color={color} />
    </View>
  );
}

export type LegendRow = { id: string; label: string; color: string; amount: number; percent: number };

/** Chart legend with the numbers the ring only hints at. */
export function Legend({ rows }: { rows: readonly LegendRow[] }) {
  return (
    <View style={styles.legend}>
      {rows.map((row) => (
        <View
          key={row.id}
          accessible
          aria-label={moneyStrings.legendRow(row.label, row.amount)}
          style={styles.legendRow}
        >
          <View style={[styles.legendDot, { backgroundColor: row.color }]} />
          <Text style={styles.legendLabel} numberOfLines={1}>
            {row.label}
          </Text>
          <Amount value={row.amount} size={12} />
        </View>
      ))}
    </View>
  );
}

/** Pill tabs / chips row (periods, Траты / Доходы). */
export function PillRow<T extends string>({
  options,
  value,
  onChange,
  grow,
}: {
  options: readonly { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  grow?: boolean;
}) {
  return (
    <View style={[styles.pills, grow ? styles.pillsTrack : null]}>
      {options.map((option) => {
        const selected = option.id === value;
        return (
          <Pressable
            key={option.id}
            role="button"
            aria-label={option.label}
            aria-selected={selected}
            onPress={() => onChange(option.id)}
            style={[
              styles.pill,
              grow ? styles.pillGrow : null,
              selected ? (grow ? styles.pillSegmentOn : styles.pillOn) : grow ? null : styles.pillOff,
            ]}
          >
            <Text
              style={[styles.pillText, selected && !grow ? styles.pillTextOn : null]}
              numberOfLines={1}
              adjustsFontSizeToFit={grow}
              minimumFontScale={0.8}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function MoneyCard({ children, tight }: { children: ReactNode; tight?: boolean }) {
  return <View style={[styles.card, tight ? styles.cardTight : null]}>{children}</View>;
}

const styles = StyleSheet.create({
  pixel: {
    fontFamily: font.pixel,
    fontWeight: "400",
  },
  amount: {
    alignItems: "center",
    flexDirection: "row",
    flexShrink: 0,
    gap: 6,
  },
  hero: {
    backgroundColor: moneyColors.heroFace,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.m + 4,
  },
  heroCaption: {
    color: moneyColors.heroSubtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  bar: {
    borderRadius: 6,
    height: 12,
    overflow: "hidden",
  },
  barFill: {
    borderRadius: 6,
    height: 12,
  },
  tileRow: {
    flexDirection: "row",
    gap: spacing.s,
  },
  tile: {
    backgroundColor: colors.card,
    borderRadius: 16,
    flex: 1,
    gap: spacing.s,
    justifyContent: "space-between",
    minHeight: 80,
    padding: 12,
  },
  tileLabel: {
    color: colors.subtle,
    fontSize: 13,
    fontWeight: "700",
  },
  tileNumber: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
    marginTop: spacing.s,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  action: {
    alignItems: "center",
    gap: 6,
    minHeight: minTarget,
    minWidth: 80,
  },
  actionEdge: {
    backgroundColor: colors.raisedEdge,
    borderRadius: 32,
    paddingBottom: 4,
  },
  actionEdgeOff: {
    backgroundColor: colors.disabledFace,
  },
  actionPressed: {
    paddingBottom: 0,
    paddingTop: 4,
  },
  actionFace: {
    alignItems: "center",
    backgroundColor: colors.raisedFace,
    borderRadius: 32,
    height: 60,
    justifyContent: "center",
    width: 60,
  },
  actionFaceOff: {
    backgroundColor: colors.track,
  },
  actionFaceMarked: {
    backgroundColor: colors.highlight,
  },
  actionCaption: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  actionCaptionOff: {
    color: colors.subtle,
  },
  op: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 56,
    paddingVertical: spacing.s,
  },
  opDivider: {
    borderBottomColor: colors.track,
    borderBottomWidth: 1,
  },
  opIcon: {
    alignItems: "center",
    backgroundColor: colors.track,
    borderRadius: 20,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  opText: {
    flex: 1,
    minWidth: 0,
  },
  opTitle: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  opSubtitle: {
    color: colors.subtle,
    fontSize: 13,
    marginTop: 2,
  },
  legend: {
    alignSelf: "stretch",
    gap: 4,
  },
  legendRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    minHeight: 32,
  },
  legendDot: {
    borderRadius: 4,
    height: 16,
    width: 16,
  },
  legendLabel: {
    color: colors.text,
    flex: 1,
    fontSize: type.body,
  },
  pills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  pillsTrack: {
    backgroundColor: colors.track,
    borderRadius: 16,
    flexWrap: "nowrap",
    gap: 4,
    padding: 4,
  },
  pill: {
    alignItems: "center",
    borderRadius: 24,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  pillGrow: {
    borderRadius: 12,
    flex: 1,
    paddingHorizontal: 4,
  },
  pillOff: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderWidth: 1,
  },
  pillOn: {
    backgroundColor: colors.text,
  },
  pillSegmentOn: {
    backgroundColor: colors.card,
    borderBottomColor: colors.accent,
    borderBottomWidth: 3,
  },
  pillText: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  pillTextOn: {
    color: "#FFFFFF",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.m,
  },
  cardTight: {
    paddingVertical: spacing.s,
  },
});
