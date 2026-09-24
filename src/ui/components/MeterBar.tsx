import { StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";

export function MeterBar({
  icon,
  label,
  value,
  compact,
}: {
  icon: string;
  label: string;
  value: number;
  compact?: boolean;
}) {
  const width = `${Math.max(0, Math.min(100, value))}%` as const;
  const name = strings.meterLine(label, value);
  if (compact) {
    return (
      <View accessible aria-label={name} style={styles.compact}>
        <Text aria-hidden style={styles.compactIcon}>
          {icon}
        </Text>
        <View style={styles.compactTrack} accessibilityElementsHidden>
          <View style={[styles.compactFill, { width }]} />
        </View>
      </View>
    );
  }
  return (
    <View style={styles.wrap}>
      <View style={styles.line}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{name}</Text>
      </View>
      <View style={styles.track} accessibilityElementsHidden>
        <View style={[styles.fill, { width }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.s,
    marginBottom: spacing.s,
  },
  line: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  icon: {
    fontSize: type.body,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
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
  compactIcon: {
    fontSize: type.section,
  },
  compact: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: spacing.s,
    minWidth: 0,
  },
  compactTrack: {
    backgroundColor: colors.track,
    borderRadius: radius.card,
    flex: 1,
    height: spacing.m,
    overflow: "hidden",
  },
  compactFill: {
    backgroundColor: colors.fill,
    height: spacing.m,
  },
});
