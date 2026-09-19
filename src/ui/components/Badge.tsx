import { StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing, type } from "../theme";

export function Badge({
  icon,
  word,
  value,
}: {
  icon: string;
  word: string;
  value: string | number;
}) {
  return (
    <View style={styles.badge}>
      <Text
        aria-hidden
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.icon}
      >
        {icon}
      </Text>
      <Text style={styles.line}>
        {word} <Text>{String(value)}</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: "center",
    backgroundColor: colors.badgeFill,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.s,
    minHeight: 32,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  icon: {
    fontSize: type.body,
  },
  line: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
});
