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
import { colors, minTarget, radius, spacing, type } from "../theme";
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

/** Словарик: «Слова» are the kid terms as tiles, «Уроки» are the unscored cards of open уроки. */
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
              onPress={() => setTab(item.id)}
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
        lessons.map((task) => (
          <View key={task.id} style={styles.lesson}>
            <View style={[styles.lessonHead, { backgroundColor: TOPIC_TINT[task.topic] }]}>
              <View style={styles.lessonIcon}>
                <Pictogram glyph={TOPIC_ICON[task.topic]} size={24} />
              </View>
              <View style={styles.lessonTitle}>
                <CoinText text={task.title} style={styles.section} />
              </View>
            </View>
            <View style={styles.lessonBody}>
              {lessonCards(task).map((card) => (
                <View key={card.id} style={styles.lessonCard}>
                  {card.title ? (
                    <CoinText text={withPet(card.title, petName)} style={styles.cardTitle} />
                  ) : null}
                  <CoinText text={withPet(card.text, petName)} style={styles.body} />
                </View>
              ))}
            </View>
          </View>
        ))
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
  lesson: {
    backgroundColor: colors.card,
    borderRadius: radius.card,
    overflow: "hidden",
  },
  lessonHead: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
    padding: spacing.m,
  },
  lessonIcon: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  lessonTitle: {
    flex: 1,
    minWidth: 0,
  },
  lessonBody: {
    gap: spacing.m,
    padding: spacing.m,
  },
  lessonCard: {
    borderLeftColor: colors.track,
    borderLeftWidth: 4,
    gap: 4,
    paddingLeft: spacing.s + 4,
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
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
