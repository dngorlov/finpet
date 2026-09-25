import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ECONOMY } from "../../core/config";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { Card } from "../components/Card";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { MeterBar } from "../components/MeterBar";
import { NavTile } from "../components/NavTile";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
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
  taskTitle: string | null;
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
      const task = preferredHubTask(content.tasks, dayN, profile.isDemo, game.listTaskProgress(profileId));
      const activeGoal = savings.activeGoal;
      const goalItem = activeGoal
        ? content.catalog.find((item) => item.id === activeGoal.key && item.kind === "optional")
        : undefined;
      const cost = activeGoal?.cost ?? 0;
      const remaining = activeGoal?.remaining ?? 0;
      setHub({
        profile,
        savings,
        day,
        allowanceCredited: opened.status === "opened" && opened.allowanceCredited,
        taskTitle: task?.title ?? null,
        taskId: task?.id ?? null,
        goalName: goalItem?.name ?? "",
        accumulated: cost - remaining,
        cost,
        remaining,
      });
      setHubMessage(null);
      if (opened.status === "opened" && opened.allowanceCredited) {
        setFeedback({
          deltas: { balance: ECONOMY.allowance },
          chip: strings.allowanceDayChip,
        });
      }
    }, [content, game, meta]),
  );

  if (!hub) {
    return (
      <Screen header={<StatusStrip />}>
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  const waiting = !hub.day.open;
  const go = (route: "Plan" | "Shop" | "Savings" | "TaskList" | "Progress" | "AdultGate") => {
    navigation.navigate(route);
  };

  return (
    <Screen header={<StatusStrip />}>
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
      <MeterBar icon={strings.careIcon} label={strings.care} value={hub.profile.care} />
      <MeterBar icon={strings.moodIcon} label={strings.mood} value={hub.profile.mood} />
      {hub.profile.isDemo ? <Text style={styles.body}>{strings.demoBanner}</Text> : null}
      {hub.allowanceCredited ? <Text style={styles.body}>{strings.allowanceRibbon}</Text> : null}
      <Card>
        {hub.goalName ? (
          <>
            <Text style={styles.cardTitle}>{hub.goalName}</Text>
            <Text style={styles.body}>{strings.goalRatio(hub.accumulated, hub.cost)}</Text>
            <Text style={styles.body}>{strings.goalRemaining(hub.remaining)}</Text>
          </>
        ) : (
          <Text style={styles.cardTitle}>{strings.goalEmptyPrompt}</Text>
        )}
      </Card>
      {hub.taskTitle ? (
          <Card>
            <Text style={styles.cardTitle}>{hub.taskTitle}</Text>
            <PrimaryButton
              label={strings.playTask}
              onPress={() => {
                if (!hub.taskId) return;
                navigation.navigate("TaskRun", { taskId: hub.taskId });
              }}
            />
          </Card>
      ) : null}
      <View style={styles.grid}>
        <View style={styles.tileAnchor}>
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
            onPress={() => go("Plan")}
            style={styles.tileFill}
          />
        </View>
        <View style={styles.tileAnchor}>
          <NavTile
            pictogram={strings.navShopPictogram}
            word={strings.navShop}
            hint={waiting ? strings.waitingEconomyHint : undefined}
            disabled={waiting}
            onPress={() => go("Shop")}
            style={styles.tileFill}
          />
        </View>
        <View style={styles.tileAnchor}>
          <NavTile
            pictogram={strings.navSavingsPictogram}
            word={strings.navSavings}
            detail={String(hub.savings.pot)}
            hint={waiting ? strings.waitingEconomyHint : undefined}
            disabled={waiting}
            onPress={() => go("Savings")}
            style={styles.tileFill}
          />
        </View>
        <NavTile
          pictogram={strings.navTasksPictogram}
          word={strings.navTasks}
          onPress={() => go("TaskList")}
        />
        <NavTile
          pictogram={strings.navProgressPictogram}
          word={strings.navProgress}
          onPress={() => go("Progress")}
        />
        <NavTile
          pictogram={strings.navAdultPictogram}
          word={strings.navAdult}
          onPress={() => go("AdultGate")}
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
            game.closeDay(profileId, content.catalog, content.bills);
            navigation.navigate("DaySummary");
          }}
        />
      )}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  tileAnchor: {
    flexBasis: "47%",
    flexGrow: 1,
    maxWidth: "48%",
  },
  tileFill: {
    flexBasis: "100%",
    maxWidth: "100%",
  },
});
