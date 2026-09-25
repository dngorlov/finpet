import { StyleSheet, Text } from "react-native";
import { BackButton } from "../components/BackButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { strings } from "../strings";
import { colors, type } from "../theme";
import { ResultsBody } from "./progressPanels";

export default function ResultsScreen() {
  return (
    <Screen header={<StatusStrip />}>
      <BackButton />
      <Text style={styles.title}>{strings.tabResults}</Text>
      <ResultsBody />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
});
