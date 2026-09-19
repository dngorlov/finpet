import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import DaySummaryScreen from "../screens/DaySummaryScreen";
import FirstRunScreen from "../screens/FirstRunScreen";
import MainScreen from "../screens/MainScreen";
import PlanScreen from "../screens/PlanScreen";
import ProgressScreen from "../screens/ProgressScreen";
import SettingsScreen from "../screens/SettingsScreen";
import ShopScreen from "../screens/ShopScreen";
import SavingsScreen from "../screens/SavingsScreen";
import StartingBudgetScreen from "../screens/StartingBudgetScreen";
import AdultGateScreen from "../screens/AdultGateScreen";
import DemoScreen from "../screens/DemoScreen";
import StubScreen from "../screens/StubScreen";
import TaskListScreen from "../screens/TaskListScreen";
import TaskResultScreen from "../screens/TaskResultScreen";
import TaskRunScreen from "../screens/TaskRunScreen";
import { useSession } from "../session/SessionProvider";
import type { RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { meta } = useSession();
  const hasProfile = Boolean(meta.get(META_KEYS.activeProfileId));

  return (
    <Stack.Navigator initialRouteName={hasProfile ? "Main" : "FirstRun"} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FirstRun" component={FirstRunScreen} />
      <Stack.Screen name="StartingBudget" component={StartingBudgetScreen} />
      <Stack.Screen name="Main" component={MainScreen} />
      <Stack.Screen name="Plan" component={PlanScreen} />
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="Savings" component={SavingsScreen} />
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="DaySummary" component={DaySummaryScreen} />
      <Stack.Screen name="AdultGate" component={AdultGateScreen} />
      <Stack.Screen name="Demo" component={DemoScreen} />
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskRun" component={TaskRunScreen} />
      <Stack.Screen name="TaskResult" component={TaskResultScreen} />
      <Stack.Screen name="Stub" component={StubScreen} />
    </Stack.Navigator>
  );
}
