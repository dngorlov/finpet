import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { taskUnlockOrder, unlockedTasks, type TaskContent } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import { BackButton } from "../components/BackButton";
import { ScreenTitle } from "../components/ScreenTitle";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { completedTaskIds } from "../tasks/model";
import { colors, minTarget, spacing, type } from "../theme";

type Tab = "words" | "lessons";

function withPet(text: string, petName: string): string {
  return text.split("{pet}").join(petName);
}

function lessonCards(task: TaskContent) {
  return task.nodes.filter((node) => node.kind === "card");
}

/** Словарик: «Слова» are the kid terms, «Уроки» are the unscored cards of open уроки. */
export default function HandbookScreen() {
  const { game, meta, content } = useSession();
  const [tab, setTab] = useState<Tab>("words");
  const [openId, setOpenId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [lessons, setLessons] = useState<TaskContent[]>([]);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const profile = game.getProfile(profileId);
      const progress = game.listTaskProgress(profileId);
      const openIds = new Set(
        unlockedTasks(content.tasks, completedTaskIds(progress), profile.isDemo).map((task) => task.id),
      );
      setPetName(profile.petName);
      setLessons(
        taskUnlockOrder(content.tasks).filter(
          (task) => !task.comingSoon && !task.correction && openIds.has(task.id),
        ),
      );
    }, [content.tasks, game, meta]),
  );

  return (
    <Screen header={<StatusStrip />}>
      <BackButton />
      <ScreenTitle style={styles.title}>{strings.glossaryTitle}</ScreenTitle>
      <View style={styles.tabs}>
        <Chip label={strings.tabWords} selected={tab === "words"} onPress={() => setTab("words")} />
        <Chip label={strings.tabLessons} selected={tab === "lessons"} onPress={() => setTab("lessons")} />
      </View>
      {tab === "words"
        ? content.terms.map((term) => (
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
          ))
        : lessons.map((task) => (
            <Card key={task.id}>
              <Text style={styles.section}>{task.title}</Text>
              {lessonCards(task).map((card) => (
                <View key={card.id}>
                  {card.title ? <Text style={styles.termLabel}>{withPet(card.title, petName)}</Text> : null}
                  <Text style={styles.body}>{withPet(card.text, petName)}</Text>
                </View>
              ))}
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
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
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
