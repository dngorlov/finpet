import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { CatalogItemContent } from "../../data/content";
import { METERS } from "../../core/config";
import { itemMeterEffects } from "../../core/economy";
import { CoinText } from "../components/CoinText";
import { PixelIcon } from "../components/Pictogram";
import { PixelSprite } from "../components/PixelSprite";
import type { PixelIconName } from "../pixelIconXml";
import { strings } from "../strings";
import { shopStrings } from "../stringsShop";
import { colors, font, minTarget, radius, spacing, type } from "../theme";

/**
 * Soft tints for Магазин tiles and tags. Text on every tint stays colors.text
 * (≥12:1), so the tints only carry grouping, never meaning on their own.
 */
const tint = {
  mandatoryTile: colors.highlight,
  optionalTile: "#E9F0C4",
  goalTag: "#FFE08A",
  neutralTag: colors.track,
  loss: "#FFDAD4",
  gain: "#EEF3D2",
} as const;

export const hiddenFromReader = {
  "aria-hidden": true as const,
  accessibilityElementsHidden: true as const,
  importantForAccessibility: "no-hide-descendants" as const,
};

export type RowFlags = { due: boolean; goal: boolean; bought: boolean; postponed: boolean };

function meterWordLower(meter: "care" | "mood") {
  return meter === "care" ? shopStrings.careWord : shopStrings.moodWord;
}

function meterSprite(meter: "care" | "mood") {
  return meter === "care" ? ("food" as const) : ("mood" as const);
}

function meterWord(meter: "care" | "mood") {
  return meter === "care" ? strings.care : strings.mood;
}

function feedsSatiety(item: CatalogItemContent) {
  return itemMeterEffects(item).some((effect) => effect.meter === "care");
}

/** What a due Счёт costs the pet if the day closes unpaid. */
export function skipLine(item: CatalogItemContent) {
  const food = feedsSatiety(item);
  const meter = food ? ("care" as const) : ("mood" as const);
  const delta = food ? METERS.missedFoodPenalty : METERS.missedOtherBillPenalty;
  return {
    meter,
    delta,
    shared: !food,
    spoken: strings.shopSkipA11y(item.name, meterWord(meter), delta, !food),
  };
}

export function rowAnnouncement(item: CatalogItemContent, balance: number, flags: RowFlags) {
  const parts = [item.name, strings.shopPrice(item.price)];
  for (const effect of itemMeterEffects(item)) {
    parts.push(strings.shopMeterA11y(meterWord(effect.meter), effect.delta));
  }
  if (flags.due && !flags.bought) parts.push(skipLine(item).spoken);
  if (flags.goal) parts.push(strings.shopGoalChip);
  if (flags.bought) parts.push(strings.shopBought);
  if (item.once) parts.push(strings.shopOnceChip);
  if (balance < item.price) parts.push(strings.shopShortfall(item.price - balance));
  if (flags.postponed) parts.push(shopStrings.tagPostponed);
  return parts.join(". ");
}

/** Big square picture of the item on a tile tinted by its kind. */
export function ItemTile({ item, size = 72 }: { item: CatalogItemContent; size?: number }) {
  return (
    <View
      {...hiddenFromReader}
      style={[
        styles.tile,
        { height: size, width: size, borderRadius: Math.round(size / 4) },
        { backgroundColor: item.kind === "mandatory" ? tint.mandatoryTile : tint.optionalTile },
      ]}
    >
      <Text style={[styles.tileEmoji, { fontSize: Math.round(size * 0.66), lineHeight: Math.round(size * 0.9) }]}>
        {item.icon}
      </Text>
    </View>
  );
}

/** Pixel-font number with the coin sprite. */
export function CoinPrice({ amount, large }: { amount: number; large?: boolean }) {
  return (
    <View style={styles.price}>
      <Text style={[styles.priceNumber, large ? styles.priceLarge : null]}>{amount}</Text>
      <PixelSprite name="coin" size={large ? 24 : 20} />
    </View>
  );
}

function Tag({ label, fill, icon }: { label: string; fill: string; icon?: PixelIconName }) {
  return (
    <View style={[styles.tag, { backgroundColor: fill }]}>
      {icon ? <PixelIcon name={icon} size={16} color={colors.text} /> : null}
      <Text style={styles.tagText}>{label}</Text>
    </View>
  );
}

/**
 * State tags: Цель, Куплено, Один раз, Отложено. No category or «Счёт на
 * сегодня» (Дима, 2026-09-26): the tab already says the category, and the
 * «не купишь: …» line already marks today's Счёт.
 */
export function ItemTags({ item, flags }: { item: CatalogItemContent; flags: RowFlags }) {
  if (!flags.goal && !flags.bought && !item.once && !flags.postponed) return null;
  return (
    <View style={styles.tags}>
      {flags.goal ? <Tag label={strings.shopGoalChip} fill={tint.goalTag} icon="star" /> : null}
      {flags.bought ? <Tag label={strings.shopBought} fill={tint.gain} icon="check" /> : null}
      {item.once ? <Tag label={strings.shopOnceChip} fill={tint.neutralTag} /> : null}
      {flags.postponed ? <Tag label={shopStrings.tagPostponed} fill={tint.neutralTag} icon="clock" /> : null}
    </View>
  );
}

/**
 * Pet effects with Andrei's food / mood sprites. `announce` gives each line its
 * own spoken name (drawer); in a row the row label already says it all.
 */
export function ItemEffects({
  item,
  showSkip,
  announce,
}: {
  item: CatalogItemContent;
  showSkip: boolean;
  announce: boolean;
}) {
  const skip = showSkip ? skipLine(item) : null;
  return (
    <View style={styles.effects} {...(announce ? {} : hiddenFromReader)}>
      {itemMeterEffects(item).map((effect) => (
        <View
          key={effect.meter}
          style={[styles.effect, { backgroundColor: tint.gain }]}
          accessible={announce}
          accessibilityLabel={announce ? strings.shopMeterA11y(meterWord(effect.meter), effect.delta) : undefined}
        >
          <PixelSprite name={meterSprite(effect.meter)} size={16} />
          <Text style={styles.effectText}>{shopStrings.effectGain(effect.delta, meterWordLower(effect.meter))}</Text>
        </View>
      ))}
      {skip ? (
        <View
          style={[styles.effect, { backgroundColor: tint.loss }]}
          accessible={announce}
          accessibilityLabel={announce ? skip.spoken : undefined}
        >
          <PixelSprite name={skip.meter === "mood" ? "mood-down" : meterSprite(skip.meter)} size={16} />
          <Text style={styles.effectText}>{shopStrings.effectSkip(skip.delta, meterWordLower(skip.meter))}</Text>
        </View>
      ) : null}
    </View>
  );
}

/** Compact row action: short visible word, full spoken name, 48 high. */
export function RowButton({
  label,
  spoken,
  icon,
  primary,
  onPress,
}: {
  label: string;
  spoken: string;
  icon: PixelIconName;
  primary?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      aria-label={spoken}
      onPress={onPress}
      style={({ pressed }) => [
        styles.rowButton,
        primary ? styles.rowButtonPrimary : styles.rowButtonSecondary,
        pressed ? styles.rowButtonPressed : null,
      ]}
    >
      <PixelIcon name={icon} size={20} color={primary ? colors.onRaised : colors.accentText} />
      <Text style={[styles.rowButtonLabel, primary ? styles.rowButtonLabelPrimary : null]}>{label}</Text>
    </Pressable>
  );
}

/** Two-segment switch; each half is a button with aria-selected. */
export function SegmentedTabs<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.segments}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="button"
            aria-label={option.label}
            aria-selected={selected}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected ? styles.segmentOn : null]}
          >
            <Text style={[styles.segmentLabel, selected ? styles.segmentLabelOn : null]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** One shop row: tappable info block plus Купить / Отложить. */
export function ShopRow({
  item,
  flags,
  balance,
  marked,
  onOpen,
  onBuy,
  onPostpone,
  onRestore,
}: {
  item: CatalogItemContent;
  flags: RowFlags;
  balance: number;
  marked: boolean;
  onOpen: () => void;
  onBuy: () => void;
  onPostpone: () => void;
  onRestore: () => void;
}) {
  const shortfall = balance < item.price ? item.price - balance : null;
  return (
    <View style={[styles.row, marked ? styles.rowMarked : null]}>
      <Pressable
        role="button"
        aria-label={rowAnnouncement(item, balance, flags)}
        aria-selected={marked}
        onPress={onOpen}
        style={[styles.rowInfo, flags.postponed ? styles.dim : null]}
      >
        <ItemTile item={item} />
        <View style={styles.rowMiddle}>
          <Text style={styles.name}>{item.name}</Text>
          <View {...hiddenFromReader} style={styles.rowDetails}>
            <ItemTags item={item} flags={flags} />
            <ItemEffects item={item} showSkip={flags.due && !flags.bought} announce={false} />
          </View>
        </View>
        <View style={styles.rowPrice}>
          <CoinPrice amount={item.price} />
          {shortfall != null ? (
            <View {...hiddenFromReader}>
              <CoinText coin labelled={false} text={strings.shopShortfall(shortfall)} style={styles.shortfall} />
            </View>
          ) : null}
        </View>
      </Pressable>
      <View style={styles.rowActions}>
        {flags.bought ? null : flags.postponed ? (
          <RowButton
            label={shopStrings.restore}
            spoken={shopStrings.restoreA11y(item.name)}
            icon="arrow-up"
            onPress={onRestore}
          />
        ) : (
          <RowButton
            label={shopStrings.postpone}
            spoken={shopStrings.postponeA11y(item.name)}
            icon="clock"
            onPress={onPostpone}
          />
        )}
        <RowButton
          label={shopStrings.buy}
          spoken={shopStrings.buyA11y(item.name)}
          icon="shopping-cart"
          primary
          onPress={onBuy}
        />
      </View>
    </View>
  );
}

/** Drawer header: big tile, name, price. */
export function DrawerHead({ item, children }: { item: CatalogItemContent; children?: ReactNode }) {
  return (
    <View style={styles.drawerHead}>
      <ItemTile item={item} size={96} />
      <View style={styles.drawerHeadText}>
        <Text style={styles.drawerName}>{item.name}</Text>
        <CoinPrice amount={item.price} large />
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: "center",
    justifyContent: "center",
  },
  tileEmoji: {
    textAlign: "center",
  },
  price: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  priceNumber: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
  },
  priceLarge: {
    fontSize: 24,
    lineHeight: 32,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    alignItems: "center",
    borderRadius: 10,
    minHeight: 24,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: spacing.s,
    paddingVertical: 2,
  },
  tagText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  effects: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  effect: {
    alignItems: "center",
    borderRadius: 10,
    flexDirection: "row",
    gap: 6,
    maxWidth: "100%",
    minHeight: 28,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  effectText: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "600",
    includeFontPadding: false,
    lineHeight: 18,
    textAlignVertical: "center",
  },
  rowButton: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  rowButtonPrimary: {
    backgroundColor: colors.raisedFace,
    borderBottomColor: colors.raisedEdge,
    borderBottomWidth: 3,
  },
  rowButtonSecondary: {
    backgroundColor: colors.card,
    borderColor: colors.disabledFace,
    borderWidth: 2,
  },
  rowButtonPressed: {
    opacity: 0.75,
  },
  rowButtonLabel: {
    color: colors.accentText,
    fontSize: type.button,
    fontWeight: "700",
  },
  rowButtonLabelPrimary: {
    color: colors.onRaised,
  },
  segments: {
    backgroundColor: colors.track,
    borderRadius: 16,
    flexDirection: "row",
    gap: 4,
    padding: 4,
  },
  segment: {
    alignItems: "center",
    borderRadius: 12,
    flex: 1,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.s,
  },
  segmentOn: {
    backgroundColor: colors.card,
    borderBottomColor: colors.accent,
    borderBottomWidth: 3,
  },
  segmentLabel: {
    color: colors.subtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  segmentLabelOn: {
    color: colors.text,
  },
  row: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: radius.card,
    borderWidth: 2,
    gap: spacing.s,
    padding: 12,
  },
  rowMarked: {
    backgroundColor: colors.highlight,
    borderColor: colors.accent,
  },
  rowInfo: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    minHeight: minTarget,
  },
  dim: {
    opacity: 0.5,
  },
  rowMiddle: {
    flex: 1,
    gap: 6,
  },
  rowDetails: {
    gap: 6,
  },
  name: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  rowPrice: {
    alignItems: "flex-end",
    gap: 4,
    maxWidth: 96,
  },
  shortfall: {
    color: colors.subtle,
    fontSize: 13,
    textAlign: "right",
  },
  rowActions: {
    flexDirection: "row",
    gap: spacing.s,
  },
  drawerHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.m,
  },
  drawerHeadText: {
    flex: 1,
    gap: spacing.s,
  },
  drawerName: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
});
