import { useNavigation } from "@react-navigation/native";
import { Pressable, StyleSheet, Text } from "react-native";
import { strings } from "../strings";
import { colors, minTarget, type } from "../theme";

export function BackButton() {
  const navigation = useNavigation();
  return (
    <Pressable
      role="button"
      aria-label={strings.back}
      onPress={() => navigation.goBack()}
      style={styles.button}
    >
      <Text style={styles.label}>{strings.back}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
  },
  label: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
});
