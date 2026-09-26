import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { taskUnlockOrder, unlockedTasks, type TaskContent } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import { BackButton } from "../components/BackButton";
import { BottomSheet } from "../components/BottomSheet";
import { CoinText } from "../components/CoinText";
import { Pictogram, PixelIcon } from "../components/Pictogram";
import { PrimaryButton } from "../components/PrimaryButton";
import { ScreenTitle } from "../components/ScreenTitle";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { PixelIconName } from "../pixelIconXml";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { homeStrings } from "../stringsHome";
import { completedTaskIds, type TaskTopic } from "../tasks/model";
import { colors, minTarget, spacing, type } from "../theme";
import { TOPIC_TINT } from "../topicStyle";

type Tab = "words" | "lessons";

const TABS: { id: Tab; label: string; icon: PixelIconName }[] = [
  { id: "words", label: strings.tabWords, icon: "book-open" },
  { id: "lessons", label: strings.tabLessons, icon: "clipboard" },
];

/** Word tiles cycle through the warm palette so the grid reads as a game board. */
const TILE_FILLS = [colors.badgeFill, colors.fill, colors.highlight, colors.accent] as const;

const TOPIC_ICON: Record<TaskTopic, string> = {
  budget: strings.taskTopicBudgetIcon,
  savings: strings.taskTopicSavingsIcon,
  payments: strings.taskTopicPaymentsIcon,
};

function withPet(text: string, petName: string): string {
  return text.split("{pet}").join(petName);
}

function lessonCards(task: TaskContent) {
  return task.nodes.filter((node) => node.kind === "card");
}

/** Словарик: «Слова» are the kid terms as tiles, «Уроки» are a compact list of open уроки. */
export default function HandbookScreen() {
  const { game, meta, content } = useSession();
  const [tab, setTab] = useState<Tab>("words");
  const [openId, setOpenId] = useState<string | null>(null);
  const [openLessonId, setOpenLessonId] = useState<string | null>(null);
  const [petName, setPetName] = useState("");
  const [lessons, setLessons] = useState<TaskContent[]>([]);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const profile = game.getProfile(profileId);
      const progress = game.listTaskProgress(profileId);
      const openIds = new Set(
        unlockedTasks(content.tasks, completedTaskIds(progress)).map((task) => task.id),
      );
      setPetName(profile.petName);
      setLessons(
        taskUnlockOrder(content.tasks).filter(
          (task) => !task.comingSoon && !task.correction && openIds.has(task.id),
        ),
      );
    }, [content.tasks, game, meta]),
  );

  const openTerm = content.terms.find((term) => term.id === openId) ?? null;
  const openLesson = lessons.find((task) => task.id === openLessonId) ?? null;

  function selectTab(next: Tab) {
    setTab(next);
    setOpenId(null);
    setOpenLessonId(null);
  }

  return (
    <Screen header={<StatusStrip />}>
      <BackButton />
      <ScreenTitle style={styles.title}>{strings.glossaryTitle}</ScreenTitle>
      <View style={styles.segments}>
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <Pressable
              key={item.id}
              role="button"
              aria-label={item.label}
              aria-selected={selected}
              onPress={() => selectTab(item.id)}
              style={[styles.segment, selected ? styles.segmentOn : null]}
            >
              <View style={[styles.segmentFace, selected ? styles.segmentFaceOn : null]}>
                <PixelIcon name={item.icon} color={selected ? colors.onRaised : colors.subtle} />
                <Text style={[styles.segmentLabel, selected ? styles.segmentLabelOn : null]}>
                  {item.label}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      {tab === "words" ? (
        <>
          <Text style={styles.hint}>{homeStrings.handbookWordsHint}</Text>
          <View style={styles.grid}>
            {content.terms.map((term, index) => (
              <Pressable
                key={term.id}
                role="button"
                aria-label={term.term}
                onPress={() => setOpenId(term.id)}
                style={({ pressed }) => [
                  styles.tile,
                  { backgroundColor: TILE_FILLS[index % TILE_FILLS.length] },
                  pressed ? styles.tilePressed : null,
                ]}
              >
                <Text style={styles.tileLabel}>{term.term}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : lessons.length === 0 ? (
        <Text style={styles.hint}>{homeStrings.handbookEmptyLessons}</Text>
      ) : (
        <>
          <Text style={styles.hint}>{homeStrings.handbookLessonsHint}</Text>
          <View style={styles.lessonList}>
            {lessons.map((task) => (
              <Pressable
                key={task.id}
                role="button"
                aria-label={task.title}
                onPress={() => setOpenLessonId(task.id)}
                style={({ pressed }) => [styles.lessonRow, pressed ? styles.lessonRowPressed : null]}
              >
                <View style={[styles.lessonMark, { backgroundColor: TOPIC_TINT[task.topic] }]}>
                  <Pictogram glyph={TOPIC_ICON[task.topic]} size={18} />
                </View>
                <Text style={styles.lessonRowLabel}>{task.title}</Text>
                <PixelIcon name="arrow-right" size={16} color={colors.subtle} />
              </Pressable>
            ))}
          </View>
        </>
      )}
      <BottomSheet
        visible={openTerm !== null}
        onClose={() => setOpenId(null)}
        footer={<PrimaryButton label={strings.gotIt} onPress={() => setOpenId(null)} />}
      >
        {openTerm ? (
          <>
            <Text style={styles.sheetTerm}>{openTerm.term}</Text>
            <CoinText text={openTerm.definition} style={styles.sheetDefinition} />
          </>
        ) : null}
      </BottomSheet>
      <BottomSheet
        visible={openLesson !== null}
        onClose={() => setOpenLessonId(null)}
        footer={<PrimaryButton label={strings.gotIt} onPress={() => setOpenLessonId(null)} />}
      >
        {openLesson ? (
          <>
            <Text style={styles.sheetTerm}>{openLesson.title}</Text>
            {lessonCards(openLesson).map((card) => (
              <View key={card.id} style={styles.lessonCard}>
                {card.title ? (
                  <CoinText text={withPet(card.title, petName)} style={styles.cardTitle} />
                ) : null}
                <CoinText text={withPet(card.text, petName)} style={styles.body} />
              </View>
            ))}
          </>
        ) : null}
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  segments: {
    backgroundColor: colors.track,
    borderRadius: 16,
    flexDirection: "row",
    gap: spacing.s,
    padding: 6,
  },
  segment: {
    borderRadius: 12,
    flex: 1,
    paddingBottom: 4,
  },
  segmentOn: {
    backgroundColor: colors.raisedEdge,
  },
  segmentFace: {
    alignItems: "center",
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
    minHeight: 56,
  },
  segmentFaceOn: {
    backgroundColor: colors.raisedFace,
  },
  segmentLabel: {
    color: colors.subtle,
    fontSize: 18,
    fontWeight: "700",
  },
  segmentLabelOn: {
    color: colors.onRaised,
  },
  hint: {
    color: colors.subtle,
    fontSize: type.body,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s + 4,
  },
  tile: {
    alignItems: "center",
    borderBottomColor: "rgba(34, 26, 18, 0.25)",
    borderBottomWidth: 5,
    borderRadius: 16,
    flexBasis: "46%",
    flexGrow: 1,
    justifyContent: "center",
    minHeight: 96,
    minWidth: minTarget,
    padding: spacing.m,
  },
  tilePressed: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  tileLabel: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "800",
    textAlign: "center",
  },
  lessonList: {
    gap: spacing.s,
  },
  lessonRow: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 14,
    flexDirection: "row",
    gap: spacing.s,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  lessonRowPressed: {
    opacity: 0.7,
  },
  lessonMark: {
    alignItems: "center",
    borderRadius: 8,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  lessonRowLabel: {
    color: colors.text,
    flex: 1,
    fontSize: type.body,
    fontWeight: "700",
  },
  lessonCard: {
    borderLeftColor: colors.track,
    borderLeftWidth: 4,
    gap: 4,
    paddingLeft: spacing.s + 4,
  },
  cardTitle: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
    lineHeight: 22,
  },
  sheetTerm: {
    color: colors.accentText,
    fontSize: type.title,
    fontWeight: "800",
  },
  sheetDefinition: {
    color: colors.text,
    fontSize: type.section,
    lineHeight: 28,
  },
});
