import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BackButton } from "../components/BackButton";
import { AppButton } from "../components/AppButton";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Glossary">;

export default function GlossaryScreen({ navigation }: Props) {
  const { content } = useSession();
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <BackButton />
      <Text style={styles.title}>{strings.glossaryTitle}</Text>
      <AppButton label={strings.howToPlay} onPress={() => navigation.navigate("Onboarding", { replay: true })} />
      {content.terms.map((term) => (
        <View key={term.id} style={styles.row}>
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
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    gap: spacing.m,
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  row: {
    gap: spacing.s,
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
