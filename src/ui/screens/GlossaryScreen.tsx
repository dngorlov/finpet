import { useState } from "react";
import { Pressable, StyleSheet, Text } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Glossary">;

export default function GlossaryScreen({ navigation }: Props) {
  const { content } = useSession();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>{strings.glossaryTitle}</Text>
      <Card>
        <PrimaryButton label={strings.howToPlay} onPress={() => navigation.navigate("HowToPlay")} />
      </Card>
      {content.terms.map((term) => (
        <Card key={term.id}>
          <Pressable
            role="button"
            aria-label={term.term}
            aria-expanded={openId === term.id}
            onPress={() => setOpenId((current) => (current === term.id ? null : term.id))}
            style={styles.term}
          >
            <Text style={styles.termLabel}>{term.term}</Text>
          </Pressable>
          {openId === term.id ? <Text style={styles.def}>{term.definition}</Text> : null}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  term: {
    justifyContent: "center",
    minHeight: minTarget,
  },
  termLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  def: {
    color: colors.text,
    fontSize: type.body,
  },
});
