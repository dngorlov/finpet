import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";
import { APP_BUILD, APP_VERSION } from "../appInfo";

/**
 * M0 placeholder for the Main hub (ROADMAP §4.2 #4) — the hub layout,
 * meters and cards arrive in M2.
 */
export default function MainScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Text style={styles.title}>{strings.appName}</Text>
      <Text style={styles.greeting}>{strings.mainGreeting}</Text>
      <Text style={styles.version}>{strings.versionLine(APP_VERSION, APP_BUILD)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: "center",
    padding: spacing.l,
  },
  greeting: {
    color: colors.subtle,
    fontSize: type.body,
    marginTop: spacing.s,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  version: {
    color: colors.subtle,
    fontSize: type.body,
    marginTop: spacing.m,
  },
});
