import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, minTarget, spacing, type } from "../theme";

export function AppButton({
  label,
  disabled,
  onPress,
  ...rest
}: { label: string } & PressableProps) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      onPress={onPress}
      style={[styles.button, disabled ? styles.disabled : null]}
      {...rest}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.accent,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  disabled: {
    opacity: 0.4,
  },
  label: {
    color: colors.card,
    fontSize: type.body,
    fontWeight: "700",
  },
});
