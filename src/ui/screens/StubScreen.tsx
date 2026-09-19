import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import type { RootStackParamList, StubDestination } from "../navigation/types";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Stub">;

const COPY: Record<StubDestination, string> = {
  plan: strings.stubPlan,
  shop: strings.stubShop,
  savings: strings.stubSavings,
  adult: strings.stubAdult,
};

export default function StubScreen({ route }: Props) {
  return (
    <Screen>
      <BackButton />
      <Card>
        <Text style={styles.body}>{COPY[route.params.destination]}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
