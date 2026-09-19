import { Pressable, StyleSheet, Text } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

export function Chip({
  label,
  selected,
  onPress,
  disabled,
  pictogram,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  pictogram?: string;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-selected={selected}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      onPress={onPress}
      style={[styles.chip, selected ? styles.chipOn : null, disabled ? styles.chipOff : null]}
    >
      {pictogram ? (
        <Text aria-hidden style={styles.label}>
          {pictogram}
        </Text>
      ) : null}
      <Text style={styles.label}>{label}</Text>
      {selected ? (
        <Text
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.check}
        >
          {strings.selectedCheck}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  chipOn: {
    backgroundColor: colors.highlight,
    borderColor: colors.accent,
  },
  chipOff: {
    backgroundColor: colors.disabledFace,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
  },
  check: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
});
