import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { colors, radius, spacing } from "../theme";

export function SpeechBubble({
  children,
  accessibilityLabel,
}: {
  children: ReactNode;
  accessibilityLabel: string;
}) {
  return (
    <View style={styles.wrap}>
      <View aria-hidden accessibilityElementsHidden style={styles.tail} />
      <View accessible aria-label={accessibilityLabel} style={styles.card}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    alignSelf: "stretch",
  },
  tail: {
    borderBottomColor: colors.card,
    borderBottomWidth: 10,
    borderLeftColor: "transparent",
    borderLeftWidth: 8,
    borderRightColor: "transparent",
    borderRightWidth: 8,
    height: 0,
    width: 0,
  },
  card: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    padding: spacing.m,
  },
});
