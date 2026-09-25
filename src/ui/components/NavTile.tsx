import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { strings } from "../strings";
import { Pictogram } from "./Pictogram";
import { colors, minTarget, radius, spacing, type } from "../theme";

const EDGE = 4;

export function NavTile({
  pictogram,
  word,
  onPress,
  highlighted,
  hint,
  detail,
  disabled,
  style,
}: {
  pictogram: string;
  word: string;
  onPress: () => void;
  highlighted?: boolean;
  hint?: string;
  detail?: string;
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
        <Pictogram glyph={pictogram} size={48} />
        <Text style={styles.word}>{word}</Text>
        {highlighted && !disabled ? <Pictogram glyph={strings.selectedCheck} /> : null}
        {disabled ? <Pictogram glyph={strings.waitingLockIcon} /> : null}
        {detail ? <Text style={styles.hint}>{detail}</Text> : null}
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
  word: {
    color: colors.text,
    fontSize: type.button,
    fontWeight: "700",
    textAlign: "center",
  },
  hint: {
    color: colors.text,
    fontSize: type.body,
    textAlign: "center",
  },
});
