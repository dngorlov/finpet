import { Pressable, StyleSheet, Text, type PressableProps } from "react-native";
import { buttonIcon } from "../buttonIcon";
import { colors, minTarget, spacing, type } from "../theme";
import { PixelIcon } from "./Pictogram";

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
      <PixelIcon name={buttonIcon(label)} color={disabled ? colors.subtle : colors.accentText} />
      <Text style={[styles.label, disabled ? styles.labelDisabled : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  label: {
    color: colors.accentText,
    flexShrink: 1,
    fontSize: type.button,
    fontWeight: "700",
  },
  labelDisabled: {
    color: colors.subtle,
  },
});
