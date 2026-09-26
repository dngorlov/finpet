import { useEffect, useRef, useState, type Ref } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { CoinText } from "../components/CoinText";
import { Fab, FabStack } from "../components/Fab";
import { PixelIcon } from "../components/Pictogram";
import { PixelSprite } from "../components/PixelSprite";
import { PetView } from "../pet/PetView";
import { poseFromMeters } from "../pet/keys";
import { strings } from "../strings";
import { homeStrings } from "../stringsHome";
import { shopStrings } from "../stringsShop";
import { colors, font, minTarget, radius, spacing } from "../theme";

/** Before the first layout pass (and in jest, which never lays out). */
const FALLBACK_PET = 240;
/** Floor band, as a share of the scene height. */
const FLOOR_SHARE = 0.3;
/** How long a pet line stays up. */
const SPEECH_MS = 3500;
/** Quiet gap before the pet starts the next line on its own. */
const QUIET_MS = 8000;

export type HomePet = {
  species: string;
  color: string;
  accessory: string;
  petName: string;
  care: number;
  mood: number;
};

function petLines(pet: HomePet): readonly string[] {
  if (pet.care < 30) return homeStrings.petLinesHungry;
  const pose = poseFromMeters(pet.care, pet.mood);
  if (pose === "sad") return homeStrings.petLinesSad;
  if (pose === "happy") return homeStrings.petLinesHappy;
  return homeStrings.petLinesIdle;
}

/** Which pool the pet is speaking from. Hungry wins over the pose. */
function speechMood(pet: HomePet) {
  if (pet.care < 30) return "hungry" as const;
  return poseFromMeters(pet.care, pet.mood);
}

/**
 * Главная like «Говорящий Том»: the pet stands big in a pixel room, the day and
 * the Цель float as small pills on top, Магазин and Итоги are round buttons
 * bottom-right. Nothing scrolls.
 */
export function HomeScene({
  pet,
  day,
  waiting,
  goalName,
  goalIcon = "",
  threshold = null,
  accumulated,
  cost,
  canPickGoal = false,
  onPickGoal,
  onShop,
  onResults,
  dayTip,
  onDayTip,
  dropRef,
  onDropLayout,
}: {
  pet: HomePet;
  day: number;
  waiting: boolean;
  goalName: string;
  goalIcon?: string;
  threshold?: string | null;
  accumulated: number;
  cost: number;
  /** Копилка is open, so an empty Цель can offer «Выбери цель». */
  canPickGoal?: boolean;
  onPickGoal?: () => void;
  onShop: () => void;
  onResults: () => void;
  /** «День N» explanation is open. The screen behind owns the tap-outside catcher. */
  dayTip: boolean;
  onDayTip: (open: boolean) => void;
  /** Anchor for the tap shield that keeps the explanation from closing itself. */
  dropRef?: Ref<View>;
  onDropLayout?: () => void;
}) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [line, setLine] = useState<string | null>(null);
  const petRef = useRef(pet);
  petRef.current = pet;
  const turn = useRef(0);
  const showRef = useRef<() => void>(() => {});
  const mood = speechMood(pet);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    turn.current = 0;

    const show = () => {
      const lines = petLines(petRef.current);
      setLine(lines[turn.current % lines.length] ?? null);
      turn.current += 1;
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (cancelled) return;
        setLine(null);
        timer = setTimeout(() => {
          if (!cancelled) show();
        }, QUIET_MS);
      }, SPEECH_MS);
    };

    showRef.current = show;
    show();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [mood]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setBox((current) => (current.width === width && current.height === height ? current : { width, height }));
  };

  const measured = box.width > 0 && box.height > 0;
  // Snap to 8 px so the pixel art scales by whole steps.
  const petSize = measured
    ? Math.max(120, Math.floor(Math.min(box.width * 0.68, box.height * 0.56) / 8) * 8)
    : FALLBACK_PET;
  const floorHeight = measured ? Math.round(box.height * FLOOR_SHARE) : 160;
  const petBottom = Math.round(floorHeight * 0.35);
  // Nudge left so the pet clears the round buttons on the right.
  const petLeft = measured ? Math.max(spacing.s, Math.round((box.width - petSize) / 2 - spacing.l)) : undefined;

  const say = () => showRef.current();

  const progress = cost > 0 ? Math.max(0, Math.min(1, accumulated / cost)) : 0;

  return (
    <View style={styles.scene} onLayout={onLayout}>
      {/* Room: wall, window, skirting board, floor planks. Pure decoration. */}
      <View aria-hidden accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>
        <View style={[styles.wall, { bottom: floorHeight }]} />
        <View style={[styles.window, { bottom: floorHeight + spacing.l + 96 }]}>
          <View style={styles.pane}>
            <View style={styles.sun} />
          </View>
          <View style={styles.pane} />
          <View style={styles.pane} />
          <View style={styles.pane} />
        </View>
        <View style={[styles.floor, { height: floorHeight }]}>
          <View style={styles.skirting} />
          <View style={styles.plank} />
          <View style={styles.plank} />
          <View style={styles.plank} />
        </View>
        <View
          style={[
            styles.shadow,
            {
              bottom: petBottom - 10,
              width: petSize * 0.7,
              left: (petLeft ?? (box.width - petSize) / 2) + petSize * 0.15,
            },
          ]}
        />
      </View>

      <View style={[styles.petSlot, { bottom: petBottom }, petLeft === undefined ? styles.petCentered : { left: petLeft }]}>
        {line ? (
          <View style={styles.bubble} accessibilityLiveRegion="polite">
            <Text style={styles.bubbleText}>{line}</Text>
            <View aria-hidden style={styles.bubbleTail} />
          </View>
        ) : null}
        <Pressable role="button" aria-label={homeStrings.petTalk(pet.petName)} onPress={say}>
          <PetView
            species={pet.species}
            color={pet.color}
            accessory={pet.accessory}
            petName={pet.petName}
            care={pet.care}
            mood={pet.mood}
            size={petSize}
          />
        </Pressable>
      </View>

      <View pointerEvents="box-none" style={styles.hud}>
        <View style={styles.hudRow}>
          <View style={styles.dayPill}>
            <Text style={styles.dayText}>{strings.journalDay(day)}</Text>
            <Pressable
              role="button"
              aria-label={shopStrings.dailyDropHint}
              accessibilityState={{ expanded: dayTip }}
              onPress={() => onDayTip(!dayTip)}
              style={styles.dayInfo}
            >
              <PixelIcon name="info-box" size={20} color={colors.card} />
            </Pressable>
          </View>
          {goalName ? (
            <View
              accessible
              aria-label={`${homeStrings.goalA11y(goalName, accumulated, cost)}${threshold ? `. ${threshold}` : ""}`}
              style={styles.goal}
            >
              <View style={styles.goalRow}>
                {goalIcon ? (
                  <Text aria-hidden style={styles.goalEmoji}>
                    {goalIcon}
                  </Text>
                ) : (
                  <PixelIcon name="star" size={20} color={colors.accentText} />
                )}
                <View style={styles.goalName}>
                  <CoinText inline labelled={false} text={goalName} style={styles.goalTitle} />
                </View>
                <Text style={styles.goalRatio}>{strings.goalRatio(accumulated, cost)}</Text>
                <PixelSprite name="coin" size={16} />
              </View>
              <View style={styles.goalTrack}>
                <View style={[styles.goalFill, { width: `${Math.round(progress * 100)}%` }]} />
              </View>
              {threshold ? <Text style={styles.goalThreshold}>{threshold}</Text> : null}
            </View>
          ) : canPickGoal ? (
            <Pressable
              role="button"
              aria-label={strings.goalEmptyPrompt}
              onPress={onPickGoal}
              style={({ pressed }) => [styles.goal, pressed ? styles.goalPressed : null]}
            >
              <View style={styles.goalRow}>
                <PixelIcon name="star" size={20} color={colors.accentText} />
                <Text style={styles.goalTitle}>{strings.goalEmptyPrompt}</Text>
              </View>
            </Pressable>
          ) : null}
        </View>
        {dayTip ? (
          <View ref={dropRef} onLayout={onDropLayout} style={styles.drop}>
            <Text style={styles.dropText}>{shopStrings.dailyRule}</Text>
          </View>
        ) : null}
        {waiting ? (
          <View style={styles.hudRow}>
            <View style={[styles.pill, styles.pillWaiting]}>
              <PixelIcon name="clock" size={16} color={colors.subtle} />
              <Text style={styles.pillText}>{strings.waitingBanner}</Text>
            </View>
          </View>
        ) : null}
      </View>

      <FabStack>
        <Fab
          label={strings.navShop}
          icon={<PixelIcon name="shopping-cart" size={32} color={waiting ? colors.subtle : colors.onRaised} />}
          disabled={waiting}
          accessibilityHint={waiting ? strings.waitingEconomyHint : undefined}
          onPress={onShop}
        />
        <Fab
          label={strings.tabResults}
          icon={<PixelIcon name="clipboard" size={32} color={colors.onRaised} />}
          onPress={onResults}
        />
      </FabStack>
    </View>
  );
}

const styles = StyleSheet.create({
  scene: {
    backgroundColor: colors.track,
    flex: 1,
    overflow: "hidden",
  },
  wall: {
    backgroundColor: colors.track,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  window: {
    backgroundColor: colors.raisedEdge,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    height: 92,
    left: spacing.l,
    padding: 4,
    position: "absolute",
    width: 92,
  },
  pane: {
    backgroundColor: colors.card,
    height: 38,
    overflow: "hidden",
    width: 38,
  },
  sun: {
    backgroundColor: colors.accent,
    height: 12,
    left: 6,
    position: "absolute",
    top: 6,
    width: 12,
  },
  floor: {
    backgroundColor: colors.badgeFill,
    bottom: 0,
    gap: spacing.l,
    left: 0,
    position: "absolute",
    right: 0,
  },
  skirting: {
    backgroundColor: colors.raisedEdge,
    height: 8,
  },
  plank: {
    backgroundColor: colors.accent,
    height: 4,
    opacity: 0.5,
  },
  shadow: {
    backgroundColor: colors.disabledFace,
    borderRadius: 999,
    height: 20,
    position: "absolute",
  },
  petSlot: {
    alignItems: "center",
    position: "absolute",
  },
  petCentered: {
    alignSelf: "center",
  },
  bubble: {
    backgroundColor: colors.card,
    borderColor: colors.raisedEdge,
    borderRadius: 12,
    borderWidth: 3,
    marginBottom: 6,
    maxWidth: 240,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  bubbleText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  bubbleTail: {
    alignSelf: "center",
    backgroundColor: colors.card,
    borderBottomColor: colors.raisedEdge,
    borderBottomWidth: 3,
    borderRightColor: colors.raisedEdge,
    borderRightWidth: 3,
    bottom: -9,
    height: 14,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    width: 14,
  },
  hud: {
    gap: spacing.s,
    left: spacing.m,
    position: "absolute",
    right: spacing.m,
    top: spacing.m,
  },
  hudRow: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  dayPill: {
    alignItems: "center",
    backgroundColor: colors.raisedEdge,
    borderRadius: 12,
    flexDirection: "row",
    minHeight: minTarget,
    paddingLeft: spacing.m,
  },
  dayInfo: {
    alignItems: "center",
    height: minTarget,
    justifyContent: "center",
    width: minTarget,
  },
  dayText: {
    color: colors.card,
    fontFamily: font.pixel,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
  },
  drop: {
    alignSelf: "flex-start",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    maxWidth: "100%",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  dropText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  goalPressed: {
    opacity: 0.7,
  },
  goal: {
    backgroundColor: colors.card,
    borderColor: colors.disabledFace,
    borderRadius: 12,
    borderWidth: 2,
    flex: 1,
    gap: 6,
    minHeight: 44,
    minWidth: 160,
    paddingHorizontal: spacing.s + 4,
    paddingVertical: 6,
  },
  goalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  goalName: {
    flex: 1,
    minWidth: 0,
  },
  goalTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  goalEmoji: {
    fontSize: 20,
  },
  goalThreshold: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  goalRatio: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
  goalTrack: {
    backgroundColor: colors.track,
    borderRadius: 4,
    height: 8,
    overflow: "hidden",
  },
  goalFill: {
    backgroundColor: colors.fill,
    height: 8,
  },
  pill: {
    alignItems: "center",
    borderRadius: radius.card,
    flexDirection: "row",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: spacing.m,
  },
  pillWaiting: {
    backgroundColor: colors.card,
  },
  pillText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
