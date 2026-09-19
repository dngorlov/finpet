import { StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";

export function MeterBar({ icon, label, value }: { icon: string; label: string; value: number }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.line}>
        <Text style={styles.icon}>{icon}</Text>
        <Text style={styles.label}>{strings.meterLine(label, value)}</Text>
      </View>
      <View style={styles.track} accessibilityElementsHidden>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, value))}%` }]} />
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
});
