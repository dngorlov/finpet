import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { colors, minTarget, spacing, type } from "../theme";

export function TextButton({
  label,
  disabled,
  onPress,
  ...rest
}: { label: string } & PressableProps) {
  return (
    <Pressable
      {...rest}
      role="button"
      aria-label={label}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      onPress={onPress}
      style={styles.button}
    >
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  label: {
    color: colors.accentText,
    fontSize: type.button,
    fontWeight: "700",
  },
});
