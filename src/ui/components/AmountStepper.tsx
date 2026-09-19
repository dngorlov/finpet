import { Pressable, StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

export function AmountStepper({
  label,
  pictogram,
  value,
  onChange,
  disabled,
  max,
}: {
  label: string;
  pictogram: string;
  value: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  max?: number;
}) {
  const plusDisabled = Boolean(disabled) || (max != null && value >= max);
  return (
    <View style={styles.row}>
      <Text aria-hidden style={styles.pictogram}>
        {pictogram}
      </Text>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        role="button"
        aria-label={strings.bucketMinus(label)}
        aria-disabled={disabled || value <= 0}
        disabled={disabled || value <= 0}
        onPress={() => onChange(value - 1)}
        style={styles.step}
      >
        <Text style={styles.stepLabel}>−</Text>
      </Pressable>
      <Text style={styles.value}>{strings.bucketValue(label, value)}</Text>
      <Pressable
        role="button"
        aria-label={strings.bucketPlus(label)}
        aria-disabled={plusDisabled}
        disabled={plusDisabled}
        onPress={() => onChange(value + 1)}
        style={styles.step}
      >
        <Text style={styles.stepLabel}>+</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  pictogram: {
    fontSize: type.section,
  },
  label: {
    color: colors.text,
    flexGrow: 1,
    fontSize: type.body,
    fontWeight: "700",
  },
  step: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
  },
  stepLabel: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  value: {
    color: colors.text,
    fontSize: type.body,
    minWidth: 48,
    textAlign: "center",
  },
});
