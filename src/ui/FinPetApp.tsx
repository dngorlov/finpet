import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { HowToPlayOverlay } from "./howToPlay/HowToPlayOverlay";
import { HowToPlayTourProvider } from "./howToPlay/HowToPlayTourProvider";
import { RootNavigator } from "./navigation/RootNavigator";
import type { RootStackParamList } from "./navigation/types";
import { SessionProvider } from "./session/SessionProvider";
import type { SessionPorts } from "./session/types";
import { colors } from "./theme";

const INITIAL_METRICS = {
  frame: { x: 0, y: 0, width: 360, height: 640 },
  insets: { top: 0, left: 0, right: 0, bottom: 0 },
};

export function FinPetApp({ ports }: { ports: SessionPorts }) {
  const [navigationRef] = useState(() => createNavigationContainerRef<RootStackParamList>());

  return (
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <StatusBar style="dark" />
        <SessionProvider ports={ports}>
          <HowToPlayTourProvider navigationRef={navigationRef}>
            <View style={styles.stack}>
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
              <HowToPlayOverlay />
            </View>
          </HowToPlayTourProvider>
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
  stack: {
    flex: 1,
  },
});
