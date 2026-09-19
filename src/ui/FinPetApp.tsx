import { NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { RootNavigator } from "./navigation/RootNavigator";
import { SessionProvider } from "./session/SessionProvider";
import type { SessionPorts } from "./session/types";
import { colors } from "./theme";

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function FinPetApp({ ports }: { ports: SessionPorts }) {
  return (
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <SessionProvider ports={ports}>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </SessionProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
