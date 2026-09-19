import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, radius, spacing, type } from "../theme";

const EDGE = 4;

export function NavTile({
  pictogram,
  word,
  onPress,
  highlighted,
  hint,
  disabled,
  style,
}: {
  pictogram: string;
  word: string;
  onPress: () => void;
  highlighted?: boolean;
  hint?: string;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      role="button"
      aria-label={word}
      aria-selected={highlighted}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      accessibilityHint={hint}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shell,
        highlighted && !disabled ? styles.shellHighlighted : null,
        disabled ? styles.shellDisabled : null,
        !disabled && pressed ? styles.shellPressed : null,
        style,
      ]}
    >
      <View
        style={[
          styles.face,
          highlighted && !disabled ? styles.faceHighlighted : null,
          disabled ? styles.faceDisabled : null,
        ]}
      >
        <Text
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.pictogram}
        >
          {pictogram}
        </Text>
        <Text style={styles.word}>{word}</Text>
        {highlighted && !disabled ? (
          <Text
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.check}
          >
            {strings.selectedCheck}
          </Text>
        ) : null}
        {disabled ? (
          <Text
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.pictogram}
          >
            {strings.waitingLockIcon}
          </Text>
        ) : null}
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.raisedEdge,
    borderRadius: radius.card,
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "48%",
    paddingBottom: EDGE,
  },
  shellHighlighted: {
    backgroundColor: colors.accent,
  },
  shellDisabled: {
    backgroundColor: colors.disabledFace,
  },
  shellPressed: {
    paddingBottom: 0,
    paddingTop: EDGE,
  },
  face: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    padding: spacing.s,
  },
  faceHighlighted: {
    backgroundColor: colors.highlight,
  },
  faceDisabled: {
    backgroundColor: colors.disabledFace,
  },
  pictogram: {
    fontSize: type.section,
  },
  word: {
    color: colors.text,
    fontSize: type.button,
    fontWeight: "700",
    textAlign: "center",
  },
  check: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  hint: {
    color: colors.text,
    fontSize: type.body,
    textAlign: "center",
  },
});
