import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { CoinText } from "../components/CoinText";
import { Fab, FabStack } from "../components/Fab";
import { PixelIcon } from "../components/Pictogram";
import { PixelSprite } from "../components/PixelSprite";
import { PetView } from "../pet/PetView";
import { poseFromMeters } from "../pet/keys";
import { strings } from "../strings";
import { homeStrings } from "../stringsHome";
import { colors, font, radius, spacing } from "../theme";

/** Before the first layout pass (and in jest, which never lays out). */
const FALLBACK_PET = 240;
/** Floor band, as a share of the scene height. */
const FLOOR_SHARE = 0.3;
/** How long a pet line stays up. */
const SPEECH_MS = 3500;

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

/**
 * Главная like «Говорящий Том»: the pet stands big in a pixel room, the day and
 * the Цель float as small pills on top, Магазин and Итоги are round buttons
 * bottom-right. Nothing scrolls.
 */
export function HomeScene({
  pet,
  day,
  waiting,
  allowanceCredited,
  goalName,
  accumulated,
  cost,
  onShop,
  onResults,
}: {
  pet: HomePet;
  day: number;
  waiting: boolean;
  allowanceCredited: boolean;
  goalName: string;
  accumulated: number;
  cost: number;
  onShop: () => void;
  onResults: () => void;
}) {
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [line, setLine] = useState<string | null>(null);
  const turn = useRef(0);

  useEffect(() => {
    if (!line) return;
    const timer = setTimeout(() => setLine(null), SPEECH_MS);
    return () => clearTimeout(timer);
  }, [line]);

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

  const say = () => {
    const lines = petLines(pet);
    setLine(lines[turn.current % lines.length] ?? null);
    turn.current += 1;
  };

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
          </View>
          <View
            accessible
            aria-label={goalName ? homeStrings.goalA11y(goalName, accumulated, cost) : strings.goalEmptyPrompt}
            style={styles.goal}
          >
            {goalName ? (
              <>
                <View style={styles.goalRow}>
                  <PixelIcon name="star" size={20} color={colors.accentText} />
                  <View style={styles.goalName}>
                    <CoinText inline labelled={false} text={goalName} style={styles.goalTitle} />
                  </View>
                  <Text style={styles.goalRatio}>{strings.goalRatio(accumulated, cost)}</Text>
                  <PixelSprite name="coin" size={16} />
                </View>
                <View style={styles.goalTrack}>
                  <View style={[styles.goalFill, { width: `${Math.round(progress * 100)}%` }]} />
                </View>
              </>
            ) : (
              <View style={styles.goalRow}>
                <PixelIcon name="star" size={20} color={colors.accentText} />
                <Text style={styles.goalTitle}>{strings.goalEmptyPrompt}</Text>
              </View>
            )}
          </View>
        </View>
        {waiting || allowanceCredited ? (
          <View style={styles.hudRow}>
            {waiting ? (
              <View style={[styles.pill, styles.pillWaiting]}>
                <PixelIcon name="clock" size={16} color={colors.subtle} />
                <Text style={styles.pillText}>{strings.waitingBanner}</Text>
              </View>
            ) : null}
            {allowanceCredited ? (
              <View style={[styles.pill, styles.pillAllowance]}>
                <CoinText text={strings.allowanceRibbon} style={styles.pillText} />
              </View>
            ) : null}
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
    backgroundColor: colors.raisedEdge,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.m,
  },
  dayText: {
    color: colors.card,
    fontFamily: font.pixel,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
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
  pillAllowance: {
    backgroundColor: colors.highlight,
  },
  pillText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
  },
});
