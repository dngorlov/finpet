import { useEffect } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "../components/PrimaryButton";
import { TextButton } from "../components/TextButton";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";
import { useHowToPlayTour } from "./HowToPlayTourProvider";

const DIM = "rgba(0,0,0,0.55)";

export function HowToPlayOverlay() {
  const tour = useHowToPlayTour();

  useEffect(() => {
    if (!tour.active) return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      tour.back();
      return true;
    });
    return () => subscription.remove();
  }, [tour]);

  if (!tour.active) return null;

  const hole = tour.anchor;

  return (
    <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
      {hole ? (
        <>
          <View pointerEvents="none" style={[styles.dim, { top: 0, left: 0, right: 0, height: Math.max(0, hole.y) }]} />
          <View
            pointerEvents="none"
            style={[styles.dim, { top: hole.y, left: 0, width: Math.max(0, hole.x), height: hole.height }]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.dim,
              {
                top: hole.y,
                left: hole.x + hole.width,
                right: 0,
                height: hole.height,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[styles.dim, { top: hole.y + hole.height, left: 0, right: 0, bottom: 0 }]}
          />
        </>
      ) : (
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.dim]} />
      )}
      <View pointerEvents="box-none" style={styles.chromeWrap}>
        <View style={styles.chrome}>
          <Text style={styles.body}>{tour.body}</Text>
          <TextButton label={strings.back} onPress={tour.back} />
          <PrimaryButton label={strings.next} onPress={tour.next} />
          <TextButton label={strings.skip} onPress={tour.skip} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dim: {
    backgroundColor: DIM,
    position: "absolute",
  },
  chromeWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-start",
    padding: spacing.l,
  },
  chrome: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    gap: spacing.s,
    padding: spacing.l,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
