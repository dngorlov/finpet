import { Pressable, StyleSheet, type PressableProps } from "react-native";
import { buttonIcon } from "../buttonIcon";
import { colors, minTarget, spacing, type } from "../theme";
import { CoinText } from "./CoinText";
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
      <CoinText
        inline
        labelled={false}
        text={label}
        style={[styles.label, disabled ? styles.labelDisabled : null]}
      />
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
