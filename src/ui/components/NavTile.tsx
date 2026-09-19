import { Pressable, StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, radius, spacing, type } from "../theme";

const EDGE = 4;

export function NavTile({
  pictogram,
  word,
  onPress,
  needed,
  hint,
}: {
  pictogram: string;
  word: string;
  onPress: () => void;
  needed?: boolean;
  hint?: string;
}) {
  return (
    <Pressable
      role="button"
      aria-label={word}
      onPress={onPress}
      style={({ pressed }) => [
        styles.shell,
        needed ? styles.shellNeeded : null,
        pressed ? styles.shellPressed : null,
      ]}
    >
      <View style={[styles.face, needed ? styles.faceNeeded : null]}>
        <Text
          aria-hidden
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={styles.pictogram}
        >
          {pictogram}
        </Text>
        <Text style={styles.word}>{word}</Text>
        {needed ? (
          <Text
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={styles.check}
          >
            {strings.selectedCheck}
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
  shellNeeded: {
    backgroundColor: colors.accent,
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
  faceNeeded: {
    backgroundColor: colors.highlight,
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
