import { useEffect } from "react";
import { BackHandler, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { TextButton } from "../components/TextButton";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";
import { beatById } from "./beats";
import { useHowToPlayTour } from "./HowToPlayTourProvider";

const DIM = "rgba(0,0,0,0.55)";
const TOOLTIP_WIDTH = 260;

export function HowToPlayOverlay() {
  const tour = useHowToPlayTour();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { active, back } = tour;

  useEffect(() => {
    if (!active) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      back();
      return true;
    });
    return () => subscription.remove();
  }, [active, back]);

  if (!tour.active) return null;

  const hole = tour.anchor;
  const showNext = tour.beatId ? beatById(tour.beatId)?.advance === "next" : false;
  const chromeAtBottom = hole != null && hole.y < 120;
  const tooltip = hole
    ? tooltipPosition(hole, windowWidth, windowHeight, chromeAtBottom)
    : { left: spacing.m, top: 72 };

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {hole ? (
        <>
          <View
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="auto"
            style={[styles.dim, { height: Math.max(0, hole.y), left: 0, right: 0, top: 0 }]}
          />
          <View
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="auto"
            style={[styles.dim, { height: hole.height, left: 0, top: hole.y, width: Math.max(0, hole.x) }]}
          />
          <View
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="auto"
            style={[
              styles.dim,
              { height: hole.height, left: hole.x + hole.width, right: 0, top: hole.y },
            ]}
          />
          <View
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="auto"
            style={[styles.dim, { bottom: 0, left: 0, right: 0, top: hole.y + hole.height }]}
          />
        </>
      ) : (
        <View
          accessible={false}
          importantForAccessibility="no"
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, styles.dim]}
        />
      )}

      <View
        pointerEvents="box-none"
        style={[styles.chromeBar, chromeAtBottom ? styles.chromeBottom : styles.chromeTop]}
      >
        <TextButton label={strings.back} onPress={tour.back} />
        <TextButton label={strings.skip} onPress={tour.skip} />
        {showNext ? <TextButton label={strings.next} onPress={tour.next} /> : null}
      </View>

      <View
        accessible
        accessibilityRole="text"
        accessibilityLabel={tour.body}
        pointerEvents="none"
        style={[styles.tooltip, tooltip]}
      >
        <Text aria-hidden style={styles.body}>
          {tour.body}
        </Text>
      </View>
    </View>
  );
}

function tooltipPosition(
  hole: { x: number; y: number; width: number; height: number },
  windowWidth: number,
  windowHeight: number,
  chromeAtBottom: boolean,
) {
  const below = hole.y + hole.height + spacing.s;
  const above = hole.y - 88;
  const preferBelow = below + 80 < windowHeight - (chromeAtBottom ? 72 : 0);
  const top = preferBelow ? below : Math.max(chromeAtBottom ? spacing.s : 72, above);
  const left = Math.min(Math.max(spacing.s, hole.x), windowWidth - TOOLTIP_WIDTH - spacing.s);
  return { left, top };
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: DIM,
    position: "absolute",
  },
  chromeBar: {
    backgroundColor: colors.card,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    left: 0,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    zIndex: 2,
  },
  chromeTop: {
    top: 0,
  },
  chromeBottom: {
    bottom: 0,
  },
  tooltip: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    maxWidth: TOOLTIP_WIDTH,
    padding: spacing.m,
    position: "absolute",
    zIndex: 1,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
