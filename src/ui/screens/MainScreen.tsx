import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { unlockedTasks } from "../../core/tasks";
import { ECONOMY } from "../../core/config";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { MeterBar } from "../components/MeterBar";
import { NavTile } from "../components/NavTile";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { preferredHubTask } from "../tasks/model";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type HubModel = {
  profile: ProfileView;
  savings: SavingsView;
  day: DayState;
  allowanceCredited: boolean;
  taskTitles: string[];
  taskId: string | null;
  goalName: string;
  accumulated: number;
  cost: number;
  remaining: number;
};

const HUB_PET_SIZE = 200;

export default function MainScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [hub, setHub] = useState<HubModel | null>(null);
  const [hubMessage, setHubMessage] = useState<"needPlan" | null>(null);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const opened = game.openDay(profileId);
      const profile = game.getProfile(profileId);
      const savings = game.savingsState(profileId);
      const day = game.dayState(profileId);
      const dayN = opened.status === "opened" ? opened.n : day.n;
      const unlocked = unlockedTasks(content.tasks, dayN, profile.isDemo);
      const task = preferredHubTask(content.tasks, dayN, profile.isDemo, game.listTaskProgress(profileId));
      const active = savings.activeGoal;
      const goal = content.goals.find((g) => g.id === active?.key);
      const cost = active?.cost ?? 0;
      const remaining = active?.remaining ?? 0;
      setHub({
        profile,
        savings,
        day,
        allowanceCredited: opened.status === "opened" && opened.allowanceCredited,
        taskTitles: profile.isDemo
          ? unlocked.map((row) => row.title)
          : task
            ? [task.title]
            : [],
        taskId: task?.id ?? null,
        goalName: goal?.name ?? "",
        accumulated: cost - remaining,
        cost,
        remaining,
      });
      setHubMessage(null);
      if (opened.status === "opened" && opened.allowanceCredited) {
        setFeedback({
          deltas: { balance: ECONOMY.allowance },
          cause: strings.feedbackCauseAllowance,
          nextStep: strings.feedbackNextAllowance,
        });
      }
    }, [content, game, meta]),
  );

  if (!hub) {
    return (
      <Screen>
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  const waiting = !hub.day.open;

  return (
    <Screen>
      <View style={styles.badgeStrip}>
        <Badge
          icon={strings.stageIcon}
          word={strings.stageWord}
          value={STAGE_NAMES[hub.profile.stage]}
        />
        <Badge icon={strings.balanceIcon} word={strings.balanceWord} value={hub.profile.balance} />
        <Badge icon={strings.savingsIcon} word={strings.savingsWord} value={hub.savings.pot} />
      </View>
      {waiting ? <Text style={styles.body}>{strings.waitingBanner}</Text> : null}
      <View style={styles.pet}>
        <PetView
          species={hub.profile.species}
          color={hub.profile.color}
          accessory={hub.profile.accessory}
          petName={hub.profile.petName}
          care={hub.profile.care}
          mood={hub.profile.mood}
          size={HUB_PET_SIZE}
        />
      </View>
      <TextButton label={strings.settings} onPress={() => navigation.navigate("Settings")} />
      <MeterBar icon={strings.careIcon} label={strings.care} value={hub.profile.care} />
      <MeterBar icon={strings.moodIcon} label={strings.mood} value={hub.profile.mood} />
      {hub.profile.isDemo ? <Text style={styles.body}>{strings.demoBanner}</Text> : null}
      {hub.allowanceCredited ? <Text style={styles.body}>{strings.allowanceRibbon}</Text> : null}
      <Card>
        <Text style={styles.cardTitle}>{hub.goalName}</Text>
        <Text style={styles.body}>{strings.goalRatio(hub.accumulated, hub.cost)}</Text>
        <Text style={styles.body}>{strings.goalRemaining(hub.remaining)}</Text>
      </Card>
      {hub.taskTitles.length ? (
        <Card>
          {hub.taskTitles.map((title) => (
            <Text key={title} style={styles.cardTitle}>
              {title}
            </Text>
          ))}
          <PrimaryButton
            label={strings.playTask}
            onPress={() => hub.taskId && navigation.navigate("TaskRun", { taskId: hub.taskId })}
          />
        </Card>
      ) : null}
      <View style={styles.grid}>
        <NavTile
          pictogram={strings.navPlanPictogram}
          word={strings.navPlan}
          highlighted={!waiting && hub.day.plan.status !== "confirmed"}
          hint={
            waiting
              ? strings.waitingEconomyHint
              : hub.day.plan.status === "confirmed"
                ? strings.planReady
                : strings.composePlanHint
          }
          disabled={waiting}
          onPress={() => navigation.navigate("Plan")}
        />
        <NavTile
          pictogram={strings.navShopPictogram}
          word={strings.navShop}
          hint={waiting ? strings.waitingEconomyHint : undefined}
          disabled={waiting}
          onPress={() => navigation.navigate("Shop")}
        />
        <NavTile
          pictogram={strings.navSavingsPictogram}
          word={strings.navSavings}
          hint={waiting ? strings.waitingEconomyHint : undefined}
          disabled={waiting}
          onPress={() => navigation.navigate("Savings")}
        />
        <NavTile
          pictogram={strings.navTasksPictogram}
          word={strings.navTasks}
          onPress={() => navigation.navigate("TaskList")}
        />
        <NavTile
          pictogram={strings.navProgressPictogram}
          word={strings.navProgress}
          onPress={() => navigation.navigate("Progress")}
        />
        <NavTile
          pictogram={strings.navAdultPictogram}
          word={strings.navAdult}
          onPress={() => navigation.navigate("Demo")}
        />
      </View>
      {hubMessage === "needPlan" ? <Text style={styles.body}>{strings.finishDayNeedPlan}</Text> : null}
      {waiting ? null : (
        <PrimaryButton
          label={strings.finishDay}
          onPress={() => {
            if (hub.day.plan.status !== "confirmed") {
              setHubMessage("needPlan");
              return;
            }
            const profileId = meta.get(META_KEYS.activeProfileId);
            if (!profileId) return;
            game.closeDay(profileId, content.catalog);
            navigation.navigate("DaySummary");
          }}
        />
      )}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  badgeStrip: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  pet: {
    alignItems: "center",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  cardTitle: {
    color: colors.text,
    fontSize: type.section,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
});
