import { useCallback, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
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
import { Card } from "../components/Card";
import { GlyphLabel, Pictogram } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, type } from "../theme";
import {
  completedTaskIds,
  correctionTasks,
  preferredHubTask,
  type TaskTopic,
} from "../tasks/model";

/** Background art: Andrei's Moscow map drops in here (same file name, any size, 3:4). */
const MAP_IMAGE = require("../../../assets/map/moscow.png");
const MAP_ASPECT = 3 / 4;
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

/** Карта заданий (replaces the Задания list): pins by district, unlock chain, reward left. */
export default function TaskListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { game, meta, content } = useSession();
  const [progress, setProgress] = useState<TaskProgressView[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mapWidth, setMapWidth] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const profile = game.getProfile(profileId);
      const rows = game.listTaskProgress(profileId);
      setIsDemo(profile.isDemo);
      setProgress(rows);
      setSelectedId(
        (current) =>
          current ??
          preferredHubTask(content.tasks, profile.isDemo, rows)?.id ??
          null,
      );
    }, [content.tasks, game, meta]),
  );

  const byKey = new Map(progress.map((row) => [row.taskKey, row]));
  const completed = completedTaskIds(progress);
  const openIds = new Set(
    unlockedTasks(content.tasks, completed, isDemo).map((task) => task.id),
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

  return (
    <Screen>
      <View style={styles.titleRow}>
        <ScreenTitle style={styles.title}>{strings.mapTitle}</ScreenTitle>
        <Pressable
          role="button"
          aria-label={strings.glossaryTitle}
          onPress={() => navigation.navigate("Handbook")}
          style={styles.handbook}
        >
          <Text style={styles.handbookLabel}>{strings.glossaryTitle}</Text>
        </Pressable>
      </View>
      <Text style={styles.body}>{strings.mapHint}</Text>
      <View
        style={styles.map}
        onLayout={(event) => setMapWidth(event.nativeEvent.layout.width)}
      >
        {/* Explicit width/height: on iOS an absolute-fill Image kept its
            828×1104 intrinsic size and spilled far past the box. */}
        <Image
          source={MAP_IMAGE}
          style={[
            styles.mapImage,
            mapWidth > 0
              ? { width: mapWidth, height: mapWidth / MAP_ASPECT }
              : null,
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
        <MissionSheet
          task={selected}
          state={stateOf(selected)}
          best={byKey.get(selected.id)?.bestReward ?? 0}
          blocker={missionPrerequisite(selected, content.tasks)}
          games={childGames(selected, content.tasks).map((game) => ({
            task: game,
            state: stateOf(game),
            best: byKey.get(game.id)?.bestReward ?? 0,
          }))}
          onPlay={(taskId) => navigation.navigate("TaskRun", { taskId })}
        />
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
            <Text style={styles.cardTitle}>{task.title}</Text>
            <Text style={styles.body}>{task.intro}</Text>
            <Text style={styles.body}>{strings.playTask}</Text>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

function DifficultyMarks({ level }: { level: number }) {
  return (
    <View accessible accessibilityLabel={strings.missionDifficulty(level)} style={styles.difficulty}>
      <Text style={styles.body}>{strings.missionDifficultyLabel}</Text>
      {[1, 2, 3].map((star) => (
        <Pictogram key={star} glyph="★" color={star <= level ? colors.text : colors.subtle} />
      ))}
    </View>
  );
}

function MissionSheet({
  task,
  state,
  best,
  blocker,
  games,
  onPlay,
}: {
  task: TaskContent;
  state: PinState;
  best: number;
  blocker: TaskContent | null;
  games: { task: TaskContent; state: PinState; best: number }[];
  onPlay: (taskId: string) => void;
}) {
  const topic = TOPIC_COPY[task.topic];
  return (
    <Card>
      <Text style={styles.cardTitle}>{task.title}</Text>
      <GlyphLabel
        glyph={topic.icon}
        label={`${topic.title}${task.pin ? ` · ${strings.missionDistrict(task.pin.district)}` : ""}`}
        labelStyle={styles.body}
      />
      {task.difficulty && state !== "soon" ? <DifficultyMarks level={task.difficulty} /> : null}
      {task.description ? (
        <Text style={styles.body}>{task.description}</Text>
      ) : null}
      {state === "soon" ? null : (
        <RewardLines task={task} state={state} best={best} />
      )}
      {state === "soon" ? (
        <Text style={styles.body}>{strings.missionSoon}</Text>
      ) : state === "locked" && blocker ? (
        <Text style={styles.body}>
          {strings.missionLockedAfter(blocker.title)}
        </Text>
      ) : (
        <PrimaryButton
          label={
            state === "done" ? strings.missionReplay : strings.missionStart
          }
          onPress={() => onPlay(task.id)}
        />
      )}
      {games.length > 0 ? (
        <Text style={styles.section}>{strings.missionGames}</Text>
      ) : null}
      {games.map((game) => (
        <View key={game.task.id} style={styles.game}>
          <Text style={styles.cardTitle}>{game.task.title}</Text>
          {game.task.description ? (
            <Text style={styles.body}>{game.task.description}</Text>
          ) : null}
          <RewardLines task={game.task} state={game.state} best={game.best} />
          {game.state === "locked" ? (
            <Text style={styles.body}>
              {strings.missionLockedAfter(task.title)}
            </Text>
          ) : (
            <PrimaryButton
              label={strings.missionPlayGame(game.task.title)}
              onPress={() => onPlay(game.task.id)}
            />
          )}
        </View>
      ))}
    </Card>
  );
}

function RewardLines({
  task,
  state,
  best,
}: {
  task: TaskContent;
  state: PinState;
  best: number;
}) {
  if (state !== "done")
    return (
      <Text style={styles.body}>{strings.missionRewardMax(task.reward)}</Text>
    );
  return (
    <>
      <Text style={styles.body}>
        {strings.missionRewardBest(best, task.reward)}
      </Text>
      <Text style={styles.body}>
        {strings.missionRewardLeft(rewardLeft(task, best))}
      </Text>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  titleRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  handbook: {
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
  },
  handbookLabel: {
    color: colors.text,
    fontSize: type.button,
    fontWeight: "700",
  },
  section: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  cardTitle: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  map: {
    aspectRatio: MAP_ASPECT,
    overflow: "hidden",
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
  difficulty: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  hit: {
    minHeight: minTarget,
  },
  game: {
    borderTopColor: colors.track,
    borderTopWidth: 1,
    gap: 4,
    paddingTop: 8,
  },
});
