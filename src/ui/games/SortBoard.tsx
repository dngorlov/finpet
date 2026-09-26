import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import { sortReaction, type ShopPose } from "../../core/shopPlay";
import { sortVerdict, type SortItem, type Verdict } from "../../core/tasks";
import { PrimaryButton } from "../components/PrimaryButton";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { gameStrings } from "./gameStrings";
import { gameStyles, VerdictBanner, VERDICT_TINT } from "./GameParts";
import {
  binAtPoint,
  chipDropPoint,
  DRAG_THRESHOLD,
  DROP_SLOP,
  readWindowFrame,
  type DropFrame,
} from "./sortGeometry";

const ZONE_TINTS = [
  { fill: "#FFF1DC", edge: colors.raisedEdge },
  { fill: "#EEF6CF", edge: "#6B7A00" },
];

const hiddenFromReader = {
  "aria-hidden": true as const,
  accessibilityElementsHidden: true as const,
  importantForAccessibility: "no-hide-descendants" as const,
};

/** Drag stays a press across the whole screen, so a scroll view cannot steal it. */
const PRESS_RETENTION = { top: 10000, left: 10000, right: 10000, bottom: 10000 };

/**
 * «Нужно или хочется?»: chips on top, baskets below. Drag a chip onto a
 * basket, or tap a chip and then a basket (TalkBack and one-thumb use).
 * A right basket keeps the chip; a wrong one explains and returns it.
 * «Подтвердить» appears when every chip is placed.
 */
export function SortBoard({
  bins,
  items,
  withPet,
  onAnswer,
  onDone,
  onPose,
}: {
  bins: readonly string[];
  items: readonly SortItem[];
  withPet: (text: string) => string;
  /** First try per item is the score; later tries are practice. */
  onAnswer: (index: number, verdict: Verdict) => void;
  onDone: () => void;
  /** The pet's face follows the last chip. */
  onPose?: (pose: ShopPose) => void;
}) {
  const [placed, setPlaced] = useState<Record<number, number>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ verdict: Verdict; text: string } | null>(null);
  const [streak, setStreak] = useState(0);
  const [hop, setHop] = useState<number | null>(null);
  const [meter, setMeter] = useState<"care" | "mood" | null>(null);
  const [drag, setDrag] = useState<{ index: number; dx: number; dy: number; hover: number | null } | null>(null);
  const [poolBox, setPoolBox] = useState<DropFrame>({ x: 0, y: 0, width: 0, height: 0 });
  const [chipBoxes, setChipBoxes] = useState<Record<number, DropFrame>>({});

  const zoneRefs = useRef<(View | null)[]>([]);
  const zoneFrames = useRef<DropFrame[]>([]);
  const measureGen = useRef(0);
  const originRef = useRef({ pageX: 0, pageY: 0 });
  const grabRef = useRef({ x: 0, y: 0 });
  const dragIndexRef = useRef<number | null>(null);
  const pointerRef = useRef<{ pageX: number; pageY: number } | null>(null);
  const ignorePressRef = useRef(false);

  const place = (index: number, bin: number) => {
    const item = items[index];
    if (!item) return;
    const verdict = sortVerdict(item, bin);
    const reaction = sortReaction(streak, verdict === "good" ? "good" : "bad", item.bin);
    onAnswer(index, verdict);
    setStreak(reaction.streak);
    setMeter(reaction.meter);
    onPose?.(reaction.pose);
    if (verdict === "good") {
      setHop(null);
      setPlaced((current) => ({ ...current, [index]: bin }));
      setBanner({ verdict, text: withPet(item.explanation) });
    } else {
      setHop(index);
      setBanner({ verdict, text: withPet(item.hint ?? gameStrings.sortHintDefault) });
    }
    setSelected(null);
  };

  const pool = items.map((item, index) => ({ item, index })).filter(({ index }) => placed[index] === undefined);
  const draggedItem = drag ? items[drag.index] : undefined;
  const draggedBox = drag ? chipBoxes[drag.index] : undefined;
  const floating = drag != null && poolBox.width > 0 && draggedBox != null && draggedBox.width > 0;

  const measureZones = () => {
    const gen = measureGen.current + 1;
    measureGen.current = gen;
    zoneFrames.current = [];
    zoneRefs.current.forEach((node, binIndex) => {
      readWindowFrame(node, (frame) => {
        if (measureGen.current !== gen) return;
        zoneFrames.current[binIndex] = frame;
        const active = dragIndexRef.current;
        const pointer = pointerRef.current;
        if (active == null || pointer == null) return;
        const hover = binAtPoint(pointer.pageX, pointer.pageY, zoneFrames.current, DROP_SLOP);
        setDrag((current) => {
          if (!current || current.index !== active || current.hover === hover) return current;
          return { ...current, hover };
        });
      });
    });
  };

  const dropPoint = (index: number, pageX: number, pageY: number) => {
    const box = chipBoxes[index];
    return chipDropPoint({
      pageX,
      pageY,
      originX: originRef.current.pageX,
      originY: originRef.current.pageY,
      grabX: grabRef.current.x,
      grabY: grabRef.current.y,
      width: box?.width ?? 0,
      height: box?.height ?? 0,
    });
  };

  const rememberBox = (index: number) => (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    const next = { x, y, width, height };
    setChipBoxes((current) => (sameFrame(current[index], next) ? current : { ...current, [index]: next }));
  };

  const onPoolLayout = (event: LayoutChangeEvent) => {
    const { x, y, width, height } = event.nativeEvent.layout;
    const next = { x, y, width, height };
    setPoolBox((current) => (sameFrame(current, next) ? current : next));
  };

  return (
    <View style={styles.root}>
      <Text style={gameStyles.body}>{gameStrings.sortLeft(pool.length)}</Text>
      <View style={[styles.pool, drag && !floating ? styles.poolFront : null]} onLayout={onPoolLayout}>
        {pool.map(({ item, index }) => {
          const on = selected === index;
          const draggingThis = drag?.index === index;
          const showLift = draggingThis && !floating;
          return (
            <Pressable
              key={`${item.label}-${index}`}
              role="button"
              aria-label={withPet(item.label)}
              aria-selected={on}
              cancelable={false}
              pressRetentionOffset={PRESS_RETENTION}
              // Not in the public Pressable types; blocks the native scroll view.
              {...{ blockNativeResponder: true }}
              onLayout={rememberBox(index)}
              onPressIn={(event) => {
                ignorePressRef.current = false;
                const point = pagePoint(event);
                originRef.current = point;
                grabRef.current = {
                  x: event.nativeEvent.locationX ?? 0,
                  y: event.nativeEvent.locationY ?? 0,
                };
                dragIndexRef.current = null;
                pointerRef.current = null;
                measureZones();
              }}
              onPressMove={(event) => {
                const point = pagePoint(event);
                const dx = point.pageX - originRef.current.pageX;
                const dy = point.pageY - originRef.current.pageY;
                if (Math.abs(dx) <= DRAG_THRESHOLD && Math.abs(dy) <= DRAG_THRESHOLD) return;
                const starting = dragIndexRef.current !== index;
                dragIndexRef.current = index;
                const hit = dropPoint(index, point.pageX, point.pageY);
                pointerRef.current = hit;
                const hover = binAtPoint(hit.pageX, hit.pageY, zoneFrames.current, DROP_SLOP);
                if (starting) {
                  setSelected(index);
                  setBanner(null);
                }
                setDrag({ index, dx, dy, hover });
              }}
              onPressOut={(event) => {
                const dragged = dragIndexRef.current === index;
                const point = pagePoint(event);
                const hit = dropPoint(index, point.pageX, point.pageY);
                const hover = dragged ? binAtPoint(hit.pageX, hit.pageY, zoneFrames.current, DROP_SLOP) : null;
                dragIndexRef.current = null;
                pointerRef.current = null;
                setDrag(null);
                if (!dragged) return;
                ignorePressRef.current = true;
                queueMicrotask(() => {
                  ignorePressRef.current = false;
                });
                if (hover !== null) place(index, hover);
              }}
              onPress={() => {
                if (ignorePressRef.current) {
                  ignorePressRef.current = false;
                  return;
                }
                setSelected(on ? null : index);
                setBanner(null);
              }}
              style={[
                styles.chip,
                on || draggingThis ? styles.chipOn : null,
                on && !draggingThis ? styles.chipPicked : null,
                showLift && drag ? [styles.chipLift, { transform: dragTransform(drag.dx, drag.dy) }] : null,
                draggingThis && floating ? styles.chipDim : null,
                hop === index && !draggingThis ? styles.chipHop : null,
              ]}
            >
              <ChipBody item={item} label={withPet(item.label)} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.zones}>
        {bins.map((bin, binIndex) => {
          const inside = items.map((item, index) => ({ item, index })).filter(({ index }) => placed[index] === binIndex);
          const tint = ZONE_TINTS[binIndex % ZONE_TINTS.length]!;
          const hovered = drag?.hover === binIndex;
          return (
            <View
              key={bin}
              ref={(node) => {
                zoneRefs.current[binIndex] = node;
              }}
              collapsable={false}
              style={styles.zoneSlot}
            >
              <Pressable
                role="button"
                aria-label={gameStrings.sortZoneA11y(bin, inside.length)}
                onPress={() => {
                  if (selected === null) {
                    setBanner({ verdict: "warn", text: gameStrings.sortPickFirst });
                    return;
                  }
                  place(selected, binIndex);
                }}
                style={[
                  styles.zone,
                  { backgroundColor: hovered ? colors.highlight : tint.fill, borderColor: hovered ? colors.raisedEdge : tint.edge },
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
            </View>
          );
        })}
      </View>
      {streak > 0 ? (
        <Text style={gameStyles.body}>{reactionLine(streak)}</Text>
      ) : hop != null ? (
        <Text style={gameStyles.body}>{gameStrings.sortHop}</Text>
      ) : null}
      {meter ? (
        <Text style={gameStyles.body}>{meter === "care" ? gameStrings.previewCare : gameStrings.previewMood}</Text>
      ) : null}
      {banner ? (
        <VerdictBanner
          verdict={banner.verdict}
          title={banner.verdict === "good" ? gameStrings.sortRight : banner.verdict === "bad" ? gameStrings.sortWrong : undefined}
          text={banner.text}
        />
      ) : null}
      {pool.length === 0 ? <PrimaryButton label={gameStrings.confirm} onPress={onDone} /> : null}
      {floating && drag && draggedBox && draggedItem ? (
        <View
          pointerEvents="none"
          {...hiddenFromReader}
          style={[
            styles.chip,
            styles.chipOn,
            styles.ghost,
            {
              left: poolBox.x + draggedBox.x + drag.dx,
              top: poolBox.y + draggedBox.y + drag.dy,
              transform: [{ scale: 1.08 }],
            },
          ]}
        >
          <ChipBody item={draggedItem} label={withPet(draggedItem.label)} />
        </View>
      ) : null}
    </View>
  );
}

function reactionLine(streak: number) {
  return streak % 3 === 0 ? gameStrings.sortTrick : gameStrings.sortStreak(streak);
}

function ChipBody({ item, label }: { item: SortItem; label: string }) {
  return (
    <>
      {item.icon ? (
        <Text aria-hidden style={styles.chipIcon}>
          {item.icon}
        </Text>
      ) : null}
      <Text style={styles.chipLabel}>{label}</Text>
    </>
  );
}

function pagePoint(event: GestureResponderEvent) {
  return { pageX: event.nativeEvent.pageX ?? 0, pageY: event.nativeEvent.pageY ?? 0 };
}

function dragTransform(dx: number, dy: number) {
  return [{ translateX: dx }, { translateY: dy }, { scale: 1.08 }];
}

function sameFrame(current: DropFrame | undefined, next: DropFrame) {
  return current != null && current.x === next.x && current.y === next.y && current.width === next.width && current.height === next.height;
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.m,
    overflow: "visible",
  },
  pool: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    overflow: "visible",
  },
  poolFront: {
    zIndex: 2,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.disabledFace,
    borderRadius: 24,
    borderWidth: 3,
    flexDirection: "row",
    gap: 6,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  chipOn: {
    backgroundColor: colors.highlight,
    borderColor: colors.raisedEdge,
  },
  chipPicked: {
    transform: [{ scale: 1.06 }],
  },
  chipLift: {
    elevation: 8,
    zIndex: 5,
  },
  chipDim: {
    opacity: 0.35,
  },
  chipHop: {
    transform: [{ translateY: -8 }, { rotate: "-8deg" }],
  },
  ghost: {
    elevation: 8,
    position: "absolute",
    zIndex: 5,
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
  zoneSlot: {
    flex: 1,
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
