import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "StartingBudget">;

export default function StartingBudgetScreen({ navigation }: Props) {
  return (
    <Screen
      footer={
        <PrimaryButton
          label={strings.gotIt}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: "Main" }] })}
        />
      }
    >
      <Card>
        <Text style={styles.title}>{strings.startingBudgetTitle}</Text>
        <Text style={styles.body}>{strings.startingBudgetBody}</Text>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
