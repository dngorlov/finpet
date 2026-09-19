import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import type { JournalEntry } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Progress">;
type Tab = "results" | "journal" | "glossary";

function journalLabel(entry: JournalEntry, itemName: (id: string | null) => string): string {
  if (entry.labelKey === "starting_grant") return strings.journalStartingGrant;
  if (entry.labelKey === "allowance") return strings.journalAllowance;
  if (entry.labelKey === "savings_in") return strings.journalSavingsIn;
  if (entry.labelKey === "savings_out") return strings.journalSavingsOut;
  if (entry.labelKey.startsWith("purchase:")) return strings.journalPurchase(itemName(entry.itemId));
  return entry.labelKey;
}

export default function ProgressScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [tab, setTab] = useState<Tab>("journal");
  const [rows, setRows] = useState<JournalEntry[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      game.openDay(profileId);
      setRows(game.listJournal(profileId));
    }, [game, meta]),
  );

  const groups = useMemo(() => {
    const map = new Map<number, JournalEntry[]>();
    for (const row of rows) {
      const list = map.get(row.dayN) ?? [];
      list.push(row);
      map.set(row.dayN, list);
    }
    return [...map.entries()].sort((a, b) => b[0] - a[0]);
  }, [rows]);

  const itemName = (id: string | null) => content.catalog.find((item) => item.id === id)?.name ?? id ?? "";

  return (
    <Screen>
      <BackButton />
      <Text style={styles.title}>{strings.navProgress}</Text>
      <View style={styles.tabs}>
        <Chip label={strings.tabResults} selected={tab === "results"} onPress={() => setTab("results")} />
        <Chip label={strings.tabJournal} selected={tab === "journal"} onPress={() => setTab("journal")} />
        <Chip label={strings.tabGlossary} selected={tab === "glossary"} onPress={() => setTab("glossary")} />
      </View>
      {tab === "results" ? (
        <Card>
          <Text style={styles.body}>{strings.resultsEmpty}</Text>
        </Card>
      ) : null}
      {tab === "journal"
        ? groups.map(([dayN, entries]) => (
            <Card key={dayN}>
              <Text style={styles.section}>{dayN === 0 ? strings.journalStart : strings.journalDay(dayN)}</Text>
              {entries.map((entry) => (
                <Text key={entry.id} style={styles.body}>
                  {journalLabel(entry, itemName)} {strings.journalAmount(entry.amount)}
                </Text>
              ))}
            </Card>
          ))
        : null}
      {tab === "glossary" ? (
        <>
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
              {openId === term.id ? <Text style={styles.body}>{term.definition}</Text> : null}
            </Card>
          ))}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
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
});
