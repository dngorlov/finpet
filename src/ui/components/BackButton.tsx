import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import { PixelIcon } from "./Pictogram";

export function BackButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      role="button"
      aria-label={strings.back}
      onPress={() => navigation.goBack()}
      style={styles.button}
    >
      <PixelIcon name="arrow-left" color={colors.text} />
      <Text style={styles.label}>{strings.back}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
    paddingHorizontal: spacing.s,
  },
  label: {
    color: colors.text,
    fontSize: type.button,
    fontWeight: "700",
  },
});
