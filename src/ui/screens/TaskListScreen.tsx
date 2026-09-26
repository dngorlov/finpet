import { useCallback, useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  childGames,
  missionPrerequisite,
  rewardLeft,
  taskUnlockOrder,
  unlockedTasks,
  type TaskContent,
} from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { TaskProgressView } from "../../data/repositories/gameRepository";
import { BottomSheet } from "../components/BottomSheet";
import { Card } from "../components/Card";
import { CoinText } from "../components/CoinText";
import { Fab, FabStack } from "../components/Fab";
import { GlyphLabel, Pictogram, PixelIcon } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import type { RootStackParamList } from "../navigation/types";
import { usePlayChrome } from "../navigation/playChrome";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { homeStrings } from "../stringsHome";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { TOPIC_TINT } from "../topicStyle";
import {
  completedTaskIds,
  correctionTasks,
  preferredHubTask,
  type TaskTopic,
} from "../tasks/model";

/** Background art: Andrei's Moscow map drops in here (same file name, any size, 3:4). */
const MAP_IMAGE = require("../../../assets/map/moscow.png");
const MAP_ASPECT = 3 / 4;
const MIN_MAP_HEIGHT = 200;
const PIN = 44;
const DOTS = 5;

const TOPIC_COPY: Record<TaskTopic, { title: string; icon: string }> = {
  budget: { title: strings.taskTopicBudget, icon: strings.taskTopicBudgetIcon },
  savings: {
    title: strings.taskTopicSavings,
    icon: strings.taskTopicSavingsIcon,
  },
  payments: {
    title: strings.taskTopicPayments,
    icon: strings.taskTopicPaymentsIcon,
  },
};

type PinState = "locked" | "open" | "done" | "soon";

/**
 * Карта заданий: pins by district, unlock chain, reward left. The map shrinks
 * so the selected mission's «Начать» stays above the tab bar without scrolling.
 */
export default function TaskListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { game, meta, content } = useSession();
  const { focus } = usePlayChrome();
  const [progress, setProgress] = useState<TaskProgressView[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [outer, setOuter] = useState({ width: 0, height: 0 });
  const [headerHeight, setHeaderHeight] = useState(0);
  const [panelHeight, setPanelHeight] = useState(0);
  const [fallbackWidth, setFallbackWidth] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const rows = game.listTaskProgress(profileId);
      setProgress(rows);
      setSelectedId(
        (current) =>
          current ??
          preferredHubTask(content.tasks, rows)?.id ??
          null,
      );
    }, [content.tasks, game, meta]),
  );

  useEffect(() => {
    if (focus?.kind === "lesson") setSelectedId(focus.taskId);
  }, [focus]);

  const byKey = new Map(progress.map((row) => [row.taskKey, row]));
  const completed = completedTaskIds(progress);
  const openIds = new Set(
    unlockedTasks(content.tasks, completed).map((task) => task.id),
  );
  const missions = taskUnlockOrder(content.tasks);
  const corrections = correctionTasks(content.tasks, progress);
  const stateOf = (task: TaskContent): PinState =>
    task.comingSoon
      ? "soon"
      : completed.has(task.id)
        ? "done"
        : openIds.has(task.id)
          ? "open"
          : "locked";
  const selected = missions.find((task) => task.id === selectedId) ?? null;

  // Pins sit in % of the map box so they follow the art at any screen width.
  const at = (task: TaskContent) => ({
    x: task.pin?.x ?? 0.5,
    y: task.pin?.y ?? 0.5,
  });
  const pct = (fraction: number): `${number}%` =>
    `${Math.round(fraction * 1000) / 10}%`;

  const pad = spacing.m;
  const measured = outer.width > 0 && outer.height > 0 && panelHeight > 0;
  // Map height = min(full width at 3:4, what is left once the title and the
  // mission panel fit). Width follows from the art's aspect.
  const mapHeight = measured
    ? Math.max(
        MIN_MAP_HEIGHT,
        Math.min(
          (outer.width - pad * 2) / MAP_ASPECT,
          outer.height - pad * 2 - headerHeight - panelHeight - spacing.s * 2,
        ),
      )
    : 0;
  const mapWidth = measured ? mapHeight * MAP_ASPECT : fallbackWidth;
  const mapBox = measured ? { height: mapHeight, width: mapWidth } : styles.mapFull;

  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        const { width, height } = event.nativeEvent.layout;
        setOuter((current) =>
          current.width === width && current.height === height ? current : { width, height },
        );
      }}
    >
      <ScrollView style={styles.scroll} contentContainerStyle={[styles.content, { padding: pad }]}>
        <View onLayout={(event) => setHeaderHeight(event.nativeEvent.layout.height)}>
          <ScreenTitle style={styles.title}>{strings.mapTitle}</ScreenTitle>
        </View>
        <View
          style={[styles.map, mapBox]}
          onLayout={(event) => setFallbackWidth(event.nativeEvent.layout.width)}
        >
          {/* Explicit width/height: on iOS an absolute-fill Image kept its
              828×1104 intrinsic size and spilled far past the box. */}
          <Image
            source={MAP_IMAGE}
            style={[
              styles.mapImage,
              mapWidth > 0 ? { width: mapWidth, height: mapWidth / MAP_ASPECT } : null,
            ]}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
          {missions.map((task) => {
            const before = missionPrerequisite(task, content.tasks);
            if (!before) return null;
            const from = at(before);
            const to = at(task);
            return Array.from({ length: DOTS }, (_, i) => {
              const t = (i + 1) / (DOTS + 1);
              return (
                <View
                  key={`${task.id}-dot-${i}`}
                  pointerEvents="none"
                  style={[
                    styles.dot,
                    completed.has(before.id) ? styles.dotOpen : null,
                    {
                      left: pct(from.x + (to.x - from.x) * t),
                      top: pct(from.y + (to.y - from.y) * t),
                    },
                  ]}
                />
              );
            });
          })}
          {missions.map((task) => {
            const state = stateOf(task);
            const { x, y } = at(task);
            const isSelected = task.id === selectedId;
            return (
              <Pressable
                key={task.id}
                role="button"
                aria-label={strings.missionPinA11y(task.title, state)}
                aria-selected={isSelected}
                onPress={() => setSelectedId(task.id)}
                hitSlop={(minTarget - PIN) / 2}
                style={[
                  styles.pin,
                  state === "locked" || state === "soon"
                    ? styles.pinLocked
                    : state === "done"
                      ? styles.pinDone
                      : styles.pinOpen,
                  isSelected ? styles.pinSelected : null,
                  { left: pct(x), top: pct(y) },
                ]}
              >
                <Pictogram
                  glyph={
                    state === "soon"
                      ? "⏳"
                      : state === "locked"
                        ? "🔒"
                        : state === "done"
                          ? "✓"
                          : TOPIC_COPY[task.topic].icon
                  }
                />
              </Pressable>
            );
          })}
        </View>
        {selected ? (
          <>
            <View onLayout={(event) => setPanelHeight(event.nativeEvent.layout.height)}>
              <MissionPanel
                task={selected}
                state={stateOf(selected)}
                best={byKey.get(selected.id)?.bestReward ?? 0}
                blocker={missionPrerequisite(selected, content.tasks)}
                onPlay={(taskId) => navigation.navigate("TaskRun", { taskId })}
                onMore={() => setDetailsOpen(true)}
                highlighted={
                  focus?.kind === "lesson" &&
                  focus.taskId === selected.id &&
                  stateOf(selected) === "open"
                }
              />
            </View>
            <GameRow
              parent={selected}
              games={childGames(selected, content.tasks).map((child) => ({
                task: child,
                state: stateOf(child),
              }))}
              onPlay={(taskId) => navigation.navigate("TaskRun", { taskId })}
            />
          </>
        ) : null}
        {corrections.length > 0 ? (
          <Text style={styles.section}>{strings.missionCorrections}</Text>
        ) : null}
        {corrections.map((task) => (
          <Pressable
            key={task.id}
            role="button"
            aria-label={task.title}
            onPress={() => navigation.navigate("TaskRun", { taskId: task.id })}
            style={styles.hit}
          >
            <Card>
              <CoinText text={task.title} style={styles.cardTitle} />
              <CoinText text={task.intro} style={styles.body} />
              <CoinText text={strings.playTask} style={styles.body} />
            </Card>
          </Pressable>
        ))}
      </ScrollView>
      <FabStack bottom={measured ? pad + panelHeight + spacing.s : spacing.m}>
        <Fab
          label={strings.glossaryTitle}
          icon={<PixelIcon name="book-open" size={32} color={colors.onRaised} />}
          onPress={() => navigation.navigate("Handbook")}
        />
      </FabStack>
      {selected ? (
        <MissionDetails
          visible={detailsOpen}
          task={selected}
          state={stateOf(selected)}
          best={byKey.get(selected.id)?.bestReward ?? 0}
          onClose={() => setDetailsOpen(false)}
        />
      ) : null}
    </View>
  );
}

const hiddenStar = {
  "aria-hidden": true as const,
  accessibilityElementsHidden: true as const,
  importantForAccessibility: "no" as const,
};

function DifficultyMarks({ level }: { level: number }) {
  return (
    <View accessible accessibilityLabel={strings.missionDifficulty(level)} style={styles.difficulty}>
      {[1, 2, 3].map((star) => (
        <Text
          key={star}
          {...hiddenStar}
          style={[styles.star, star <= level ? styles.starOn : styles.starOff]}
        >
          {star <= level ? strings.starFilled : strings.starEmpty}
        </Text>
      ))}
    </View>
  );
}

/** Compact bottom panel: topic + title + stars, the reward, and the one big button. */
function MissionPanel({
  task,
  state,
  best,
  blocker,
  onPlay,
  onMore,
  highlighted,
}: {
  task: TaskContent;
  state: PinState;
  best: number;
  blocker: TaskContent | null;
  onPlay: (taskId: string) => void;
  onMore: () => void;
  highlighted?: boolean;
}) {
  const topic = TOPIC_COPY[task.topic];
  return (
    <View style={styles.panel}>
      <View style={styles.panelRow}>
        <View style={[styles.topicBadge, { backgroundColor: TOPIC_TINT[task.topic] }]}>
          <Pictogram glyph={topic.icon} size={24} />
        </View>
        <View style={styles.panelTitle}>
          <CoinText text={task.title} style={styles.cardTitle} />
        </View>
        {task.difficulty && state !== "soon" ? <DifficultyMarks level={task.difficulty} /> : null}
      </View>
      <View style={styles.panelRow}>
        <View style={styles.panelReward}>
          {state === "soon" ? (
            <Text style={styles.body}>{strings.missionSoon}</Text>
          ) : state === "done" ? (
            <CoinText coin text={strings.missionRewardBest(best, task.reward)} style={styles.body} />
          ) : (
            <CoinText coin text={strings.missionRewardMax(task.reward)} style={styles.body} />
          )}
        </View>
        {state === "soon" ? null : (
          <Pressable
            role="button"
            aria-label={homeStrings.mapMoreA11y(task.title)}
            onPress={onMore}
            style={styles.more}
          >
            <Text style={styles.moreLabel}>{homeStrings.mapMore}</Text>
          </Pressable>
        )}
      </View>
      {state === "soon" ? null : state === "locked" && blocker ? (
        <View style={styles.lockedLine}>
          <PixelIcon name="lock" size={20} color={colors.subtle} />
          <Text style={[styles.body, styles.lockedText]}>
            {strings.missionLockedAfter(blocker.title)}
          </Text>
        </View>
      ) : (
        <PrimaryButton
          highlighted={highlighted}
          label={state === "done" ? strings.missionReplay : strings.missionStart}
          onPress={() => onPlay(task.id)}
        />
      )}
    </View>
  );
}

/** Mini-games of the selected pin as a row of small play chips. */
function GameRow({
  parent,
  games,
  onPlay,
}: {
  parent: TaskContent;
  games: { task: TaskContent; state: PinState }[];
  onPlay: (taskId: string) => void;
}) {
  if (games.length === 0) return null;
  return (
    <View style={styles.games}>
      <Text style={styles.gamesTitle}>{strings.missionGames}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.gameList}
      >
        {games.map((child) => {
          const locked = child.state === "locked" || child.state === "soon";
          return (
            <Pressable
              key={child.task.id}
              role="button"
              aria-label={strings.missionPlayGame(child.task.title)}
              aria-disabled={locked}
              accessibilityHint={locked ? strings.missionLockedAfter(parent.title) : undefined}
              disabled={locked}
              onPress={() => onPlay(child.task.id)}
              style={({ pressed }) => [
                styles.gameChip,
                locked ? styles.gameChipLocked : child.state === "done" ? styles.gameChipDone : null,
                pressed && !locked ? styles.gameChipPressed : null,
              ]}
            >
              <PixelIcon
                name={locked ? "lock" : child.state === "done" ? "check" : "play"}
                size={20}
                color={locked ? colors.subtle : colors.onRaised}
              />
              <CoinText
                inline
                labelled={false}
                text={child.task.title}
                style={[styles.gameLabel, locked ? styles.gameLabelLocked : null]}
              />
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

/** «Подробнее»: district, description, and what is left to earn. */
function MissionDetails({
  visible,
  task,
  state,
  best,
  onClose,
}: {
  visible: boolean;
  task: TaskContent;
  state: PinState;
  best: number;
  onClose: () => void;
}) {
  const topic = TOPIC_COPY[task.topic];
  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      footer={<PrimaryButton label={strings.gotIt} onPress={onClose} />}
    >
      <CoinText text={task.title} style={styles.sheetTitle} />
      <GlyphLabel
        glyph={topic.icon}
        label={`${topic.title}${task.pin ? ` · ${strings.missionDistrict(task.pin.district)}` : ""}`}
        labelStyle={styles.body}
      />
      {task.description ? <CoinText text={task.description} style={styles.sheetBody} /> : null}
      {state === "done" ? (
        <CoinText coin text={strings.missionRewardLeft(rewardLeft(task, best))} style={styles.body} />
      ) : null}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    gap: spacing.s,
  },
  title: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
    marginTop: spacing.s,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  map: {
    alignSelf: "center",
    borderRadius: 12,
    overflow: "hidden",
  },
  mapFull: {
    aspectRatio: MAP_ASPECT,
    width: "100%",
  },
  mapImage: {
    height: "100%",
    left: 0,
    position: "absolute",
    top: 0,
    width: "100%",
  },
  dot: {
    backgroundColor: colors.disabledFace,
    borderRadius: 3,
    height: 6,
    marginLeft: -3,
    marginTop: -3,
    position: "absolute",
    width: 6,
  },
  dotOpen: {
    backgroundColor: colors.raisedEdge,
  },
  pin: {
    alignItems: "center",
    borderColor: colors.card,
    borderRadius: PIN / 2,
    borderWidth: 3,
    height: PIN,
    justifyContent: "center",
    marginLeft: -PIN / 2,
    marginTop: -PIN / 2,
    position: "absolute",
    width: PIN,
  },
  pinOpen: {
    backgroundColor: colors.accent,
  },
  pinDone: {
    backgroundColor: colors.fill,
  },
  pinLocked: {
    backgroundColor: colors.disabledFace,
  },
  pinSelected: {
    borderColor: colors.raisedEdge,
    transform: [{ scale: 1.15 }],
  },
  panel: {
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: radius.card,
    borderWidth: 2,
    gap: spacing.s,
    padding: spacing.s + 4,
  },
  panelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  topicBadge: {
    alignItems: "center",
    borderRadius: 10,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  panelTitle: {
    flex: 1,
    minWidth: 0,
  },
  panelReward: {
    flex: 1,
    minWidth: 0,
  },
  more: {
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.s,
  },
  moreLabel: {
    color: colors.accentText,
    fontSize: type.body,
    fontWeight: "700",
    textDecorationLine: "underline",
  },
  lockedLine: {
    alignItems: "center",
    backgroundColor: colors.track,
    borderRadius: 12,
    flexDirection: "row",
    gap: spacing.s,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  lockedText: {
    color: colors.subtle,
    flex: 1,
  },
  difficulty: {
    alignItems: "center",
    flexDirection: "row",
    gap: 2,
  },
  star: {
    fontSize: 20,
    lineHeight: 24,
  },
  starOn: {
    color: colors.accent,
  },
  starOff: {
    color: colors.disabledFace,
  },
  games: {
    gap: 4,
  },
  gamesTitle: {
    color: colors.subtle,
    fontSize: type.body,
    fontWeight: "700",
  },
  gameList: {
    gap: spacing.s,
    paddingRight: 88,
  },
  gameChip: {
    alignItems: "center",
    backgroundColor: colors.highlight,
    borderBottomColor: colors.raisedFace,
    borderBottomWidth: 4,
    borderRadius: 12,
    flexDirection: "row",
    gap: 6,
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  gameChipDone: {
    backgroundColor: colors.track,
    borderBottomColor: colors.fill,
  },
  gameChipLocked: {
    backgroundColor: colors.track,
    borderBottomColor: colors.disabledFace,
  },
  gameChipPressed: {
    borderBottomWidth: 0,
    marginTop: 4,
  },
  gameLabel: {
    color: colors.onRaised,
    fontSize: type.body,
    fontWeight: "700",
  },
  gameLabelLocked: {
    color: colors.subtle,
  },
  sheetTitle: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  sheetBody: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
  },
  hit: {
    minHeight: minTarget,
  },
});
