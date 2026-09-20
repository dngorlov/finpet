import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { unlockedTasks, type TaskContent } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { TaskProgressView } from "../../data/repositories/gameRepository";
import { BackButton } from "../components/BackButton";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import { correctionTasks, TASK_TOPICS, topicTaskGroups } from "../tasks/model";

type Props = NativeStackScreenProps<RootStackParamList, "TaskList">;

const TOPIC_COPY: Record<(typeof TASK_TOPICS)[number], { title: string; icon: string }> = {
  budget: { title: strings.taskTopicBudget, icon: strings.taskTopicBudgetIcon },
  savings: { title: strings.taskTopicSavings, icon: strings.taskTopicSavingsIcon },
  payments: { title: strings.taskTopicPayments, icon: strings.taskTopicPaymentsIcon },
};

export default function TaskListScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [unlockedIds, setUnlockedIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState<TaskProgressView[]>([]);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const profile = game.getProfile(profileId);
      const day = game.dayState(profileId);
      setUnlockedIds(new Set(unlockedTasks(content.tasks, day.n, profile.isDemo).map((task) => task.id)));
      setProgress(game.listTaskProgress(profileId));
    }, [content.tasks, game, meta]),
  );

  const byKey = new Map(progress.map((row) => [row.taskKey, row]));
  const groups = topicTaskGroups(content.tasks);
  const corrections = correctionTasks(content.tasks, progress);

  return (
    <Screen header={<StatusStrip />}>
      <BackButton />
      <Text style={styles.title}>{strings.navTasks}</Text>
      {TASK_TOPICS.map((topic) => (
        <View key={topic} style={styles.group}>
          <Text style={styles.section}>{TOPIC_COPY[topic].title}</Text>
          {groups[topic].map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              icon={TOPIC_COPY[topic].icon}
              unlocked={unlockedIds.has(task.id)}
              row={byKey.get(task.id)}
              onPlay={() => navigation.navigate("TaskRun", { taskId: task.id })}
            />
          ))}
        </View>
      ))}
      {corrections.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          icon={TOPIC_COPY[task.topic].icon}
          unlocked
          row={byKey.get(task.id)}
          onPlay={() => navigation.navigate("TaskRun", { taskId: task.id })}
        />
      ))}
    </Screen>
  );
}

function TaskCard({
  task,
  icon,
  unlocked,
  row,
  onPlay,
}: {
  task: TaskContent;
  icon: string;
  unlocked: boolean;
  row: TaskProgressView | undefined;
  onPlay: () => void;
}) {
  const completed = row?.status === "completed";
  const showReward = row?.rewardPaid !== true;
  const inner = (
    <Card>
      <Text style={styles.cardTitle}>{task.title}</Text>
      <Text style={styles.body}>{icon}</Text>
      {showReward ? (
        <Badge icon={strings.balanceIcon} word={strings.taskRewardBadge} value="" />
      ) : null}
      {completed ? (
        <Badge icon={strings.selectedCheck} word={strings.taskCompleted} value="" />
      ) : null}
      {unlocked ? <Text style={styles.body}>{strings.playTask}</Text> : <Text style={styles.body}>{strings.taskLockedTomorrow}</Text>}
    </Card>
  );

  if (!unlocked) return inner;

  return (
    <Pressable role="button" aria-label={task.title} onPress={onPlay} style={styles.hit}>
      {inner}
    </Pressable>
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
  cardTitle: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  group: {
    gap: spacing.s,
  },
  hit: {
    minHeight: minTarget,
  },
});
