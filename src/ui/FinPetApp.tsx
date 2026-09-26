import { CormorantGaramond_600SemiBold } from "@expo-google-fonts/cormorant-garamond";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito";
import { PressStart2P_400Regular, useFonts } from "@expo-google-fonts/press-start-2p";
import { Unbounded_700Bold } from "@expo-google-fonts/unbounded";
import { NavigationContainer, createNavigationContainerRef } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
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
  useFonts({
    PressStart2P_400Regular,
    Nunito_800ExtraBold,
    Unbounded_700Bold,
    CormorantGaramond_600SemiBold,
  });

  return (
    <SafeAreaProvider initialMetrics={INITIAL_METRICS}>
      <SessionProvider ports={ports}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <StatusBar style="dark" />
          <NavigationContainer ref={navigationRef}>
            <RootNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SessionProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: colors.background,
    flex: 1,
  },
});
