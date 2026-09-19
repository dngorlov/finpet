import { StyleSheet, Text, View } from "react-native";
import { BackButton } from "../components/BackButton";
import { APP_BUILD, APP_VERSION } from "../appInfo";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

export default function SettingsScreen() {
  return (
    <View style={styles.screen}>
      <BackButton />
      <Text style={styles.title}>{strings.appName}</Text>
      <Text style={styles.body}>{strings.versionLine(APP_VERSION, APP_BUILD)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.m,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.subtle,
    fontSize: type.body,
  },
});
