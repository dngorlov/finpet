import { useCallback, useState } from "react";
import { StyleSheet, Text, TextInput, type Role } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { ScreenTitle } from "../components/ScreenTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { makeQuestion, product, type AdultQuestion } from "../session/adultGate";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "AdultGate">;

const TEXTBOX_ROLE = "textbox" as Role;

export default function AdultGateScreen({ navigation }: Props) {
  const [question, setQuestion] = useState<AdultQuestion | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [answer, setAnswer] = useState("");

  useFocusEffect(
    useCallback(() => {
      setQuestion(makeQuestion());
      setAttempts(0);
      setAnswer("");
    }, []),
  );

  const submit = () => {
    if (!question) return;
    if (Number(answer) === product(question)) {
      navigation.replace("Demo");
      return;
    }
    if (attempts + 1 >= 2) {
      setQuestion(makeQuestion());
      setAttempts(0);
    } else {
      setAttempts(attempts + 1);
    }
    setAnswer("");
  };

  return (
    <Screen
      footer={
        <PrimaryButton label={strings.adultGateEnter} disabled={!question || answer.trim() === ""} onPress={submit} />
      }
      keyboardShouldPersistTaps="handled"
    >
      <BackButton />
      <ScreenTitle style={styles.title}>{strings.navAdult}</ScreenTitle>
      {question ? <Text style={styles.body}>{strings.adultGatePrompt(question.a, question.b)}</Text> : null}
      <TextInput
        role={TEXTBOX_ROLE}
        aria-label={strings.adultGateAnswer}
        value={answer}
        onChangeText={setAnswer}
        keyboardType="number-pad"
        style={styles.input}
      />
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
  input: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: type.body,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
});
