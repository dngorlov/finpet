import { StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { APP_BUILD, APP_VERSION } from "../appInfo";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { strings } from "../strings";
import { colors, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  return (
    <Screen>
      <BackButton />
      <Card>
        <Text style={styles.title}>{strings.appName}</Text>
        <Text style={styles.body}>{strings.versionLine(APP_VERSION, APP_BUILD)}</Text>
      </Card>
      <PrimaryButton label={strings.navAdult} onPress={() => navigation.navigate("AdultGate")} />
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
    color: colors.subtle,
    fontSize: type.body,
  },
});
