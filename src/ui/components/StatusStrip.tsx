import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { usePlayChrome, type TaskFocus } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { META_KEYS } from "../../data/metaKeys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { currentTaskLabel, resolveCurrentTask } from "../tasks/resolveCurrentTask";
import { colors, font, minTarget, radius, spacing, type } from "../theme";
import { MeterBar } from "./MeterBar";
import { PixelSprite } from "./PixelSprite";

const EDGE = 4;

function openTask(
  task: NonNullable<ReturnType<typeof resolveCurrentTask>>,
  chrome: {
    navigation: NativeStackNavigationProp<RootStackParamList>;
    setTab: (tab: "home" | "map" | "money") => void;
    setMoney: (section: "savings" | "plan" | "journal" | "bank") => void;
    setFocus: (focus: TaskFocus) => void;
  },
) {
  if (task.kind === "buy-bills") {
    chrome.setFocus({ kind: "shop-bills" });
    chrome.navigation.navigate("Shop");
    return;
  }
  if (task.kind === "lesson") {
    chrome.setTab("map");
    chrome.setFocus({ kind: "lesson", taskId: task.taskId });
    chrome.navigation.navigate("Main");
    return;
  }
  if (task.kind === "buy-goal") {
    chrome.setTab("money");
    chrome.setMoney("savings");
    chrome.setFocus({ kind: "buy-goal" });
    chrome.navigation.navigate("Main");
    return;
  }
  chrome.setTab("money");
  chrome.setMoney(task.kind === "confirm-plan" ? "plan" : "savings");
  chrome.setFocus(task.kind === "confirm-plan" ? { kind: "plan" } : { kind: "goal" });
  chrome.navigation.navigate("Main");
}

export function StatusStrip() {
  const focused = useIsFocused();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { revision, setTab, setMoney, focus, setFocus } = usePlayChrome();
  const { game, meta, content } = useSession();
  const profileId = meta.get(META_KEYS.activeProfileId);
  void revision;
  const profile = profileId ? game.getProfile(profileId) : null;
  const task = profileId && profile ? resolveCurrentTask(game, content, profileId) : null;

  useEffect(() => {
    if (!focus) return;
    const matches =
      (task?.kind === "set-goal" && focus.kind === "goal") ||
      (task?.kind === "buy-goal" && focus.kind === "buy-goal") ||
      (task?.kind === "confirm-plan" && focus.kind === "plan") ||
      (task?.kind === "buy-bills" && focus.kind === "shop-bills") ||
      (task?.kind === "lesson" && focus.kind === "lesson" && focus.taskId === task.taskId);
    if (!matches) setFocus(null);
  }, [focus, setFocus, task]);

  if (!focused || !profile) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.status}>
        <Pressable
          role="button"
          aria-label={strings.balanceBadge(profile.balance)}
          onPress={() => {
            setTab("money");
            navigation.navigate("Main");
          }}
          style={({ pressed }) => [styles.balance, pressed ? styles.balancePressed : null]}
        >
          <PixelSprite name="coin" size={24} />
          <Text aria-hidden style={styles.balanceValue}>
            {profile.balance}
          </Text>
        </Pressable>
        <Pressable
          role="button"
          aria-label={strings.settings}
          onPress={() => navigation.navigate("Settings")}
          style={({ pressed }) => [styles.settingsShell, pressed ? styles.settingsPressed : null]}
        >
          <View style={styles.settingsFace}>
            <PixelSprite name="gear" size={28} />
          </View>
        </Pressable>
      </View>
      <View style={styles.meters}>
        <MeterBar compact sprite="food" icon={strings.careIcon} label={strings.care} value={profile.care} />
        <MeterBar compact sprite="mood" icon={strings.moodIcon} label={strings.mood} value={profile.mood} />
      </View>
      {task ? (
        <Pressable
          role="button"
          aria-label={currentTaskLabel(task, content)}
          onPress={() => openTask(task, { navigation, setTab, setMoney, setFocus })}
          style={styles.task}
        >
          <Text style={styles.taskLabel}>{currentTaskLabel(task, content)}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.background,
    gap: spacing.s,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  status: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  meters: {
    flexDirection: "row",
    gap: spacing.m,
  },
  task: {
    backgroundColor: colors.highlight,
    borderRadius: radius.card,
    minHeight: minTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  taskLabel: {
    color: colors.text,
    fontSize: type.body,
  },
  balance: {
    alignItems: "center",
    backgroundColor: colors.badgeFill,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.s,
    height: minTarget,
    justifyContent: "center",
    paddingHorizontal: spacing.m,
  },
  balancePressed: {
    opacity: 0.7,
  },
  balanceValue: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
    textAlign: "center",
    textAlignVertical: "center",
  },
  settingsShell: {
    backgroundColor: colors.raisedEdge,
    borderRadius: minTarget / 2,
    marginLeft: "auto",
    paddingBottom: EDGE,
  },
  settingsPressed: {
    paddingBottom: 0,
    paddingTop: EDGE,
  },
  settingsFace: {
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: minTarget / 2,
    height: minTarget - EDGE,
    justifyContent: "center",
    width: minTarget,
  },
});
