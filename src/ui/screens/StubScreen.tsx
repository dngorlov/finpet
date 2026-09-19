import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import type { RootStackParamList, StubDestination } from "../navigation/types";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Stub">;

const COPY: Record<StubDestination, string> = {
  plan: strings.stubPlan,
  shop: strings.stubShop,
  savings: strings.stubSavings,
  tasks: strings.stubTasks,
  adult: strings.stubAdult,
};

export default function StubScreen({ route }: Props) {
  return (
    <View style={styles.screen}>
      <BackButton />
      <Text style={styles.body}>{COPY[route.params.destination]}</Text>
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
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
