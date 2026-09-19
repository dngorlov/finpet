import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { STAGE_NAMES } from "../../core/stages";
import { unlockedTasks } from "../../core/tasks";
import { META_KEYS } from "../../data/metaKeys";
import type { ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { PrimaryButton } from "../components/PrimaryButton";
import { MeterBar } from "../components/MeterBar";
import type { RootStackParamList, StubDestination } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

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
      <View style={styles.screen}>
        <Text style={styles.body}>{strings.appName}</Text>
      </View>
    );
  }

  const goStub = (destination: StubDestination) => navigation.navigate("Stub", { destination });

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <View style={styles.topRow}>
        <PetView
          species={hub.profile.species}
          color={hub.profile.color}
          accessory={hub.profile.accessory}
          petName={hub.profile.petName}
          care={hub.profile.care}
          mood={hub.profile.mood}
        />
        <Pressable
          role="button"
          aria-label={strings.settings}
          onPress={() => navigation.navigate("Settings")}
          style={styles.settings}
        >
          <Text style={styles.settingsMark}>⚙</Text>
        </Pressable>
      </View>
      <View style={styles.stageRow}>
        <Text style={styles.stage}>{strings.stageIcon}</Text>
        <Text style={styles.stage}>{STAGE_NAMES[hub.profile.stage]}</Text>
      </View>
      <MeterBar icon="♡" label={strings.care} value={hub.profile.care} />
      <MeterBar icon="☀" label={strings.mood} value={hub.profile.mood} />
      <View style={styles.badgeRow}>
        <Text style={styles.body}>{strings.balanceBadge(hub.profile.balance)}</Text>
        <Text style={styles.body}>{strings.savingsBadge(hub.savings.pot)}</Text>
      </View>
      {hub.allowanceCredited ? <Text style={styles.body}>{strings.allowanceRibbon}</Text> : null}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{hub.goalName}</Text>
        <Text style={styles.body}>{strings.goalRatio(hub.accumulated, hub.cost)}</Text>
        <Text style={styles.body}>{strings.goalRemaining(hub.remaining)}</Text>
      </View>
      {hub.taskTitle ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{hub.taskTitle}</Text>
          <PrimaryButton label={strings.playTask} onPress={() => goStub("tasks")} />
        </View>
      ) : null}
      <View style={styles.grid}>
        <NavTile label={strings.navPlan} highlight hint={strings.composePlanHint} onPress={() => goStub("plan")} />
        <NavTile label={strings.navShop} onPress={() => goStub("shop")} />
        <NavTile label={strings.navSavings} onPress={() => goStub("savings")} />
        <NavTile label={strings.navTasks} onPress={() => goStub("tasks")} />
        <NavTile label={strings.navProgress} onPress={() => navigation.navigate("Glossary")} />
        <NavTile label={strings.navAdult} onPress={() => goStub("adult")} />
      </View>
      {planPrompt ? <Text style={styles.body}>{strings.finishDayNeedPlan}</Text> : null}
      <PrimaryButton label={strings.finishDay} onPress={() => setPlanPrompt(true)} />
    </ScrollView>
  );
}

function NavTile({
  label,
  onPress,
  highlight,
  hint,
}: {
  label: string;
  onPress: () => void;
  highlight?: boolean;
  hint?: string;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      onPress={onPress}
      style={[styles.tile, highlight ? styles.tileOn : null]}
    >
      <Text style={styles.tileLabel}>{label}</Text>
      {hint ? <Text style={styles.tileHint}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    gap: spacing.m,
    padding: spacing.l,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  settings: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: minTarget,
    minWidth: minTarget,
  },
  settingsMark: {
    fontSize: type.title,
  },
  stageRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  stage: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  badgeRow: {
    flexDirection: "row",
    gap: spacing.m,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    gap: spacing.s,
    padding: spacing.m,
  },
  cardTitle: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  tile: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 12,
    justifyContent: "center",
    minHeight: minTarget,
    padding: spacing.s,
    width: "48%",
  },
  tileOn: {
    backgroundColor: colors.highlight,
  },
  tileLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  tileHint: {
    color: colors.text,
    fontSize: type.body,
    textAlign: "center",
  },
});
