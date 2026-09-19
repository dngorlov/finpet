import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GlossaryScreen from "../screens/GlossaryScreen";
import MainScreen from "../screens/MainScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ProfileSetupScreen from "../screens/ProfileSetupScreen";
import SettingsScreen from "../screens/SettingsScreen";
import StartingBudgetScreen from "../screens/StartingBudgetScreen";
import StubScreen from "../screens/StubScreen";
import { META_KEYS } from "../session/metaKeys";
import { useSession } from "../session/SessionProvider";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { meta } = useSession();
  const hasProfile = Boolean(meta.get(META_KEYS.activeProfileId));

  return (
    <Stack.Navigator initialRouteName={hasProfile ? "Main" : "Onboarding"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="StartingBudget" component={StartingBudgetScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Glossary" component={GlossaryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Stub" component={StubScreen} />
    </Stack.Navigator>
  );
}
