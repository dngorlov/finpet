import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { Animated, BackHandler, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TextButton } from "../components/TextButton";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";
import { beatById, TOUR_CHROME_OVERLAP } from "./beats";
import { useHowToPlayTour } from "./HowToPlayTourProvider";
import { TapCursor } from "./TapCursor";

const DIM = "rgba(0,0,0,0.55)";
const TOOLTIP_WIDTH = 260;
const CHROME_HEIGHT = TOUR_CHROME_OVERLAP;

export function HowToPlayOverlay() {
  const tour = useHowToPlayTour();
  const insets = useSafeAreaInsets();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { active, back } = tour;
  const pulse = useRef(new Animated.Value(1)).current;
  const rootRef = useRef<View>(null);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (!active) return;
    rootRef.current?.measureInWindow((x, y) => {
      setOrigin((prev) => (prev.x === x && prev.y === y ? prev : { x, y }));
    });
  }, [active, tour.anchor]);

  useEffect(() => {
    if (!active) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      back();
      return true;
    });
    return () => subscription.remove();
  }, [active, back]);

  useEffect(() => {
    if (!active) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.18, duration: 450, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [active, pulse]);

  if (!tour.active) return null;

  const hole = tour.anchor
    ? {
        x: tour.anchor.x - origin.x,
        y: tour.anchor.y - origin.y,
        width: tour.anchor.width,
        height: tour.anchor.height,
      }
    : null;
  const showNext = tour.beatId ? beatById(tour.beatId)?.advance === "next" : false;
  const chromeHeight = insets.top + CHROME_HEIGHT;
  const tooltip = hole
    ? tooltipPosition(hole, windowWidth, windowHeight, chromeHeight)
    : { left: spacing.m, top: chromeHeight };

  return (
    <View ref={rootRef} pointerEvents="box-none" style={StyleSheet.absoluteFill}>
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
          <Animated.View
            accessible={false}
            importantForAccessibility="no"
            pointerEvents="none"
            style={[
              styles.pulseRing,
              {
                height: hole.height + 12,
                left: hole.x - 6,
                top: hole.y - 6,
                transform: [{ scale: pulse }],
                width: hole.width + 12,
              },
            ]}
          />
        </>
      ) : (
        <View
          accessible={false}
          importantForAccessibility="no"
          pointerEvents="auto"
          style={[StyleSheet.absoluteFill, styles.dim]}
        />
      )}

      <View pointerEvents="box-none" style={[styles.chromeBar, { paddingTop: insets.top + spacing.s }]}>
        <TextButton label={strings.back} onPress={tour.back} />
        <TextButton label={strings.skip} onPress={tour.skip} />
        {showNext ? (
          <View>
            <TextButton label={strings.next} onPress={tour.next} />
            <TapCursor />
          </View>
        ) : null}
      </View>

      <View
        accessible
        aria-label={tour.body}
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
  chromeHeight: number,
) {
  const below = hole.y + hole.height + spacing.s;
  const above = hole.y - 88;
  const preferBelow = below + 80 < windowHeight;
  const top = preferBelow ? below : Math.max(chromeHeight, above);
  const left = Math.min(Math.max(spacing.s, hole.x), windowWidth - TOOLTIP_WIDTH - spacing.s);
  return { left, top };
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: DIM,
    position: "absolute",
  },
  pulseRing: {
    borderColor: colors.accent,
    borderRadius: radius.card,
    borderWidth: 3,
    position: "absolute",
    zIndex: 1,
  },
  chromeBar: {
    backgroundColor: colors.card,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
    left: 0,
    paddingBottom: spacing.s,
    paddingHorizontal: spacing.m,
    pointerEvents: "box-none",
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 2,
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
