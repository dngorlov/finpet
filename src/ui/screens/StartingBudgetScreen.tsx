import { StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { PrimaryButton } from "../components/PrimaryButton";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "StartingBudget">;

export default function StartingBudgetScreen({ navigation }: Props) {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{strings.startingBudgetTitle}</Text>
      <Text style={styles.body}>{strings.startingBudgetBody}</Text>
      <PrimaryButton
        label={strings.gotIt}
        onPress={() => navigation.reset({ index: 0, routes: [{ name: "Main" }] })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.m,
    justifyContent: "center",
    padding: spacing.l,
  },
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
