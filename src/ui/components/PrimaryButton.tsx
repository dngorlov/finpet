import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { colors, minTarget, spacing, type } from "../theme";

const EDGE = 4;

export function PrimaryButton({
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
      style={({ pressed }) => [
        styles.shell,
        disabled ? styles.shellDisabled : styles.shellRaised,
        !disabled && pressed ? styles.shellPressed : null,
      ]}
    >
      <View style={[styles.face, disabled ? styles.faceDisabled : styles.faceRaised]}>
        <Text style={styles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 12,
  },
  shellRaised: {
    backgroundColor: colors.raisedEdge,
    paddingBottom: EDGE,
  },
  shellPressed: {
    paddingBottom: 0,
    transform: [{ translateY: EDGE }],
  },
  shellDisabled: {
    backgroundColor: colors.disabledFace,
  },
  face: {
    alignItems: "center",
    borderRadius: 12,
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  faceRaised: {
    backgroundColor: colors.raisedFace,
  },
  faceDisabled: {
    backgroundColor: colors.disabledFace,
  },
  label: {
    color: colors.onRaised,
    fontSize: type.button,
    fontWeight: "700",
  },
});
