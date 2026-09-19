import { StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

export function DevSettings({ onDeleteProfile }: { onDeleteProfile: () => void }) {
  if (!__DEV__) return null;
  return (
    <View style={styles.section}>
      <Text style={styles.heading}>{strings.devSection}</Text>
      <PrimaryButton label={strings.deleteProfile} onPress={onDeleteProfile} />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.m,
    marginTop: spacing.m,
  },
  heading: {
    color: colors.subtle,
    fontSize: type.body,
    fontWeight: "700",
  },
});
