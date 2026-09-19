import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { unlockedTasks } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { Badge } from "../components/Badge";
import { Card } from "../components/Card";
import { MeterBar } from "../components/MeterBar";
import { NavTile } from "../components/NavTile";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import type { RootStackParamList, StubDestination } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type HubModel = {
  profile: ProfileView;
  savings: SavingsView;
  allowanceCredited: boolean;
  taskTitle: string | null;
  goalName: string;
  accumulated: number;
  cost: number;
  remaining: number;
};

const HUB_PET_SIZE = 200;

export default function MainScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [hub, setHub] = useState<HubModel | null>(null);
  const [planPrompt, setPlanPrompt] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const profileId = meta.get(META_KEYS.activeProfileId);
      if (!profileId) return;
      const opened = game.openDay(profileId);
      const profile = game.getProfile(profileId);
      const savings = game.savingsState(profileId);
      const dayN = opened.status === "opened" ? opened.n : 1;
      const task = unlockedTasks(content.tasks, dayN, profile.isDemo)[0];
      const active = savings.activeGoal;
      const goal = content.goals.find((g) => g.id === active?.key);
      const cost = active?.cost ?? 0;
      const remaining = active?.remaining ?? 0;
      setHub({
        profile,
        savings,
        allowanceCredited: opened.status === "opened" && opened.allowanceCredited,
        taskTitle: task?.title ?? null,
        goalName: goal?.name ?? "",
        accumulated: cost - remaining,
        cost,
        remaining,
      });
    }, [content, game, meta]),
  );

  if (!hub) {
    return (
      <Screen>
        <Text style={styles.body}>{strings.appName}</Text>
      </Screen>
    );
  }

  const goStub = (destination: StubDestination) => navigation.navigate("Stub", { destination });

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
      <MeterBar icon="♡" label={strings.care} value={hub.profile.care} />
      <MeterBar icon="☀" label={strings.mood} value={hub.profile.mood} />
      {hub.allowanceCredited ? <Text style={styles.body}>{strings.allowanceRibbon}</Text> : null}
      <Card>
        <Text style={styles.cardTitle}>{hub.goalName}</Text>
        <Text style={styles.body}>{strings.goalRatio(hub.accumulated, hub.cost)}</Text>
        <Text style={styles.body}>{strings.goalRemaining(hub.remaining)}</Text>
      </Card>
      {hub.taskTitle ? (
        <Card>
          <Text style={styles.cardTitle}>{hub.taskTitle}</Text>
          <PrimaryButton label={strings.playTask} onPress={() => goStub("tasks")} />
        </Card>
      ) : null}
      <View style={styles.grid}>
        <NavTile
          pictogram={strings.navPlanPictogram}
          word={strings.navPlan}
          needed
          hint={strings.composePlanHint}
          onPress={() => goStub("plan")}
        />
        <NavTile
          pictogram={strings.navShopPictogram}
          word={strings.navShop}
          onPress={() => goStub("shop")}
        />
        <NavTile
          pictogram={strings.navSavingsPictogram}
          word={strings.navSavings}
          onPress={() => goStub("savings")}
        />
        <NavTile
          pictogram={strings.navTasksPictogram}
          word={strings.navTasks}
          onPress={() => goStub("tasks")}
        />
        <NavTile
          pictogram={strings.navProgressPictogram}
          word={strings.navProgress}
          onPress={() => navigation.navigate("Glossary")}
        />
        <NavTile
          pictogram={strings.navAdultPictogram}
          word={strings.navAdult}
          onPress={() => goStub("adult")}
        />
      </View>
      {planPrompt ? <Text style={styles.body}>{strings.finishDayNeedPlan}</Text> : null}
      <PrimaryButton label={strings.finishDay} onPress={() => setPlanPrompt(true)} />
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
