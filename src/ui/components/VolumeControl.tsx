import { useCallback, useEffect, useMemo, useRef } from "react";
import { PanResponder, Pressable, StyleSheet, Text, View, type GestureResponderEvent, type LayoutChangeEvent } from "react-native";
import { clampVolume, stepVolume } from "../sound/cues";
import { strings } from "../strings";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { useLatest } from "./useLatest";

/**
 * Громкость: −/+ step by 10, and a drag along the track.
 * `onChange` follows the finger. `onCommit` is a button tap or the end of a drag,
 * which is when Настройки plays a preview.
 */
export function VolumeControl({
  value,
  onChange,
  onCommit,
}: {
  value: number;
  onChange: (next: number) => void;
  onCommit: (next: number) => void;
}) {
  const quieterDisabled = value <= 0;
  const louderDisabled = value >= 100;
  const fillWidth = `${clampVolume(value)}%` as const;
  const liveRef = useRef(value);
  useEffect(() => {
    liveRef.current = value;
  }, [value]);
  const onChangeRef = useLatest(onChange);
  const onCommitRef = useLatest(onCommit);
  const trackWidthRef = useRef(0);
  // Window X of the track, locked when the finger goes down. Later locationX
  // values are local to whichever view is under the finger (the fill, the
  // label, the card), so they jump. pageX stays in window space.
  const trackPageXRef = useRef(0);

  const setFromPageX = useCallback(
    (pageX: number) => {
      const width = trackWidthRef.current;
      const origin = trackPageXRef.current;
      if (width <= 0 || !Number.isFinite(pageX) || !Number.isFinite(origin)) return;
      const x = Math.max(0, Math.min(width, pageX - origin));
      const next = clampVolume((x / width) * 100);
      liveRef.current = next;
      onChangeRef.current(next);
    },
    [onChangeRef],
  );

  // Handlers read refs when a finger moves, not while rendering.
  /* eslint-disable react-hooks/refs */
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event: GestureResponderEvent) => {
          const { pageX, locationX } = event.nativeEvent;
          if (Number.isFinite(pageX) && Number.isFinite(locationX)) {
            trackPageXRef.current = pageX - locationX;
          }
          setFromPageX(pageX);
        },
        onPanResponderMove: (event: GestureResponderEvent) => {
          setFromPageX(event.nativeEvent.pageX);
        },
        onPanResponderRelease: () => {
          onCommitRef.current(liveRef.current);
        },
      }),
    [onCommitRef, setFromPageX],
  );
  /* eslint-enable react-hooks/refs */

  const onTrackLayout = (event: LayoutChangeEvent) => {
    trackWidthRef.current = event.nativeEvent.layout.width;
  };

  const nudge = (direction: -1 | 1) => {
    onCommit(stepVolume(value, direction));
  };

  return (
    <View style={styles.block}>
      <View style={styles.row}>
        <Text style={styles.label}>{strings.soundVolume}</Text>
        <Text style={styles.value}>{strings.soundLevel(value)}</Text>
      </View>
      <View style={styles.trackRow}>
        <Pressable
          role="button"
          aria-label={strings.soundQuieter}
          aria-disabled={quieterDisabled}
          disabled={quieterDisabled}
          onPress={() => nudge(-1)}
          style={styles.step}
        >
          <Text style={styles.stepLabel}>−</Text>
        </Pressable>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          collapsable={false}
          pointerEvents="box-only"
          onLayout={onTrackLayout}
          style={styles.trackHit}
          {...panResponder.panHandlers}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: fillWidth }]} />
          </View>
        </View>
        <Pressable
          role="button"
          aria-label={strings.soundLouder}
          aria-disabled={louderDisabled}
          disabled={louderDisabled}
          onPress={() => nudge(1)}
          style={styles.step}
        >
          <Text style={styles.stepLabel}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.s,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "space-between",
  },
  label: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  value: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  trackRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
  },
  stepLabel: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  trackHit: {
    flex: 1,
    justifyContent: "center",
    minHeight: minTarget,
  },
  track: {
    backgroundColor: colors.track,
    borderRadius: radius.card,
    height: spacing.l,
    overflow: "hidden",
  },
  fill: {
    backgroundColor: colors.fill,
    borderRadius: radius.card,
    height: spacing.l,
  },
});
