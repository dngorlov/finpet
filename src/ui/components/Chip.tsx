import { Pressable, StyleSheet } from "react-native";
import { strings } from "../strings";
import { CoinText } from "./CoinText";
import { Pictogram } from "./Pictogram";
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
      {pictogram ? <Pictogram glyph={pictogram} /> : null}
      <CoinText inline labelled={false} text={label} style={styles.label} />
      {selected ? <Pictogram glyph={strings.selectedCheck} /> : null}
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
});
