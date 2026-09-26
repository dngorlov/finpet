import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BANK, ECONOMY, FEATURES } from "../../core/config";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { PixelSprite } from "../components/PixelSprite";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { Screen } from "../components/Screen";
import { StageCard } from "../components/StageCard";
import { StatusStrip } from "../components/StatusStrip";
import type { MoneySection } from "../navigation/playChrome";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { completedTaskIds } from "../tasks/model";
import { moneyStrings } from "../stringsMoney";
import { colors, minTarget, spacing, type } from "../theme";
import BankScreen from "./BankScreen";
import { HomeScene } from "./HomeScene";
import { PillRow } from "./moneyParts";
import { JournalPanel } from "./progressPanels";
import PlanScreen from "./PlanScreen";
import SavingsScreen from "./SavingsScreen";
import TaskListScreen from "./TaskListScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Main">;

type HubModel = {
  profile: ProfileView;
  savings: SavingsView;
  day: DayState;
  allowanceCredited: boolean;
  goalName: string;
  accumulated: number;
  cost: number;
  remaining: number;
  savingsOpen: boolean;
  planOpen: boolean;
  bankOpen: boolean;
};

const MONEY_OPTIONS: { id: MoneySection; label: string }[] = [
  { id: "savings", label: strings.navSavings },
  { id: "plan", label: strings.navPlan },
  { id: "journal", label: strings.tabJournal },
  { id: "bank", label: strings.navBank },
];

export default function MainScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const { tab, setTab, money, setMoney, revision } = usePlayChrome();
  const [hub, setHub] = useState<HubModel | null>(null);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  const [cardOpen, setCardOpen] = useState(false);

  const loadHub = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const opened = game.openDay(profileId);
    const bank = opened.status === "opened" ? game.collectDeposits(profileId, opened.dayId) : null;
    const profile = game.getProfile(profileId);
    const progress = game.listTaskProgress(profileId);
    const completed = completedTaskIds(progress);
    const savingsOpen = profile.isDemo || completed.has(FEATURES.savingsTaskId);
    const planOpen = profile.isDemo || completed.has(FEATURES.planTaskId);
    const bankOpen = profile.isDemo || completed.has(BANK.unlockTaskId);
    const savings = game.savingsState(profileId);
    const day = game.dayState(profileId);
    const activeGoal = savings.activeGoal;
    const goalItem = activeGoal ? content.goals.find((item) => item.id === activeGoal.key) : undefined;
    const cost = activeGoal?.cost ?? 0;
    const remaining = activeGoal?.remaining ?? 0;
    const creditedNow = opened.status === "opened" && opened.allowanceCredited;
    setHub((current) => ({
      profile,
      savings,
      day,
      allowanceCredited: creditedNow || (current?.profile.id === profile.id && current.allowanceCredited),
      goalName: goalItem?.name ?? "",
      accumulated: cost - remaining,
      cost,
      remaining,
      savingsOpen,
      planOpen,
      bankOpen,
    }));
    const bankPaid = bank && bank.paid > 0 ? bank : null;
    if (opened.status === "opened" && opened.allowanceCredited) {
      setFeedback({
        deltas: { balance: ECONOMY.allowance + (bankPaid?.paid ?? 0) },
        chip: strings.allowanceDayChip,
        cause: bankPaid ? strings.feedbackBankReturned(bankPaid.paid, bankPaid.interest) : undefined,
      });
    } else if (bankPaid) {
      setFeedback({
        deltas: { balance: bankPaid.paid },
        cause: strings.feedbackBankReturned(bankPaid.paid, bankPaid.interest),
      });
    }
  }, [content, game, meta]);

  useFocusEffect(
    useCallback(() => {
      loadHub();
    }, [loadHub]),
  );

  useEffect(() => {
    loadHub();
  }, [loadHub, revision]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (cardOpen) {
          setCardOpen(false);
          return true;
        }
        if (tab === "home") {
          BackHandler.exitApp();
          return true;
        }
        setTab("home");
        return true;
      });
      return () => subscription.remove();
    }, [cardOpen, setTab, tab]),
  );

  useFocusEffect(
    useCallback(() => {
      return () => setCardOpen(false);
    }, []),
  );

  useEffect(() => {
    if (!hub) return;
    const visible =
      (money === "savings" && hub.savingsOpen) ||
      (money === "plan" && hub.planOpen) ||
      money === "journal" ||
      (money === "bank" && hub.bankOpen);
    if (!visible) setMoney("journal");
  }, [hub, money, setMoney]);

  if (!hub) {
    return (
      <View style={styles.shell}>
        <StatusStrip />
        <Screen>
          <Text style={styles.body}>{strings.appName}</Text>
        </Screen>
      </View>
    );
  }

  const waiting = !hub.day.open;
  const options = MONEY_OPTIONS.filter((option) => {
    if (option.id === "savings") return hub.savingsOpen;
    if (option.id === "plan") return hub.planOpen;
    if (option.id === "bank") return hub.bankOpen;
    return true;
  });
  const current = options.find((option) => option.id === money) ?? options[0];

  return (
    <View style={styles.shell}>
      <View style={styles.aboveTabs}>
        <View
          accessibilityElementsHidden={cardOpen}
          importantForAccessibility={cardOpen ? "no-hide-descendants" : "auto"}
          style={styles.aboveTabs}
        >
          <StatusStrip />
          <View style={styles.bodySlot}>
            {tab === "home" ? (
              <HomeScene
                pet={{
                  species: hub.profile.species,
                  color: hub.profile.color,
                  accessory: hub.profile.accessory,
                  petName: hub.profile.petName,
                  care: hub.profile.care,
                  mood: hub.profile.mood,
                }}
                day={hub.day.n}
                waiting={waiting}
                allowanceCredited={hub.allowanceCredited}
                goalName={hub.goalName}
                accumulated={hub.accumulated}
                cost={hub.cost}
                onShop={() => navigation.navigate("Shop")}
                onResults={() => navigation.navigate("Results")}
              />
            ) : null}
            {tab === "map" ? <TaskListScreen /> : null}
            {tab === "money" ? (
              <View style={styles.money}>
                <View style={styles.menu} role="tablist" aria-label={moneyStrings.sections}>
                  <PillRow grow options={options} value={current.id} onChange={setMoney} />
                </View>
                <View style={styles.bodySlot}>
                  {money === "savings" ? <SavingsScreen /> : null}
                  {money === "plan" ? <PlanScreen /> : null}
                  {money === "journal" ? (
                    <Screen>
                      <JournalPanel />
                    </Screen>
                  ) : null}
                  {money === "bank" ? <BankScreen /> : null}
                </View>
              </View>
            ) : null}
          </View>
        </View>
        <StageCard
          stage={hub.profile.stage}
          open={cardOpen}
          onOpen={() => setCardOpen(true)}
          onClose={() => setCardOpen(false)}
        />
      </View>
      <View style={styles.tabTray}>
        <View style={styles.tabs}>
          {(
            [
              ["home", strings.tabHome, "home"],
              ["map", strings.tabMap, "map"],
              ["money", strings.tabMoney, "coin"],
            ] as const
          ).map(([id, label, icon]) => {
            const selected = tab === id;
            const ink = selected ? colors.onRaised : colors.subtle;
            return (
              <Pressable
                key={id}
                role="button"
                aria-label={label}
                aria-selected={selected}
                onPress={() => {
                  setCardOpen(false);
                  setTab(id);
                }}
                style={styles.tab}
              >
                {({ pressed }) => (
                  <>
                    <View
                      style={[
                        styles.token,
                        selected ? styles.tokenOn : null,
                        selected && pressed ? styles.tokenPressed : null,
                      ]}
                    >
                      <View style={[styles.tokenFace, selected ? styles.tokenFaceOn : null]}>
                        <View style={selected ? null : styles.spriteIdle}>
                          <PixelSprite name={icon} size={28} />
                        </View>
                      </View>
                    </View>
                    <Text style={[styles.tabLabel, selected ? styles.tabLabelOn : null, { color: ink }]}>{label}</Text>
                  </>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  aboveTabs: {
    flex: 1,
    overflow: "hidden",
  },
  bodySlot: {
    flex: 1,
  },
  money: {
    flex: 1,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  menu: {
    paddingHorizontal: spacing.m,
    paddingTop: spacing.s,
  },
  tabTray: {
    backgroundColor: colors.raisedEdge,
    paddingBottom: 4,
  },
  tabs: {
    backgroundColor: colors.track,
    flexDirection: "row",
    gap: spacing.s,
    paddingHorizontal: spacing.s,
    paddingVertical: spacing.s,
  },
  tab: {
    alignItems: "stretch",
    flex: 1,
    gap: 4,
    justifyContent: "center",
    minHeight: minTarget,
  },
  token: {
    borderRadius: 14,
    overflow: "hidden",
    paddingBottom: 4,
  },
  tokenPressed: {
    paddingBottom: 0,
    paddingTop: 4,
  },
  tokenOn: {
    backgroundColor: colors.raisedEdge,
  },
  tokenFace: {
    alignItems: "center",
    borderRadius: 14,
    justifyContent: "center",
    minHeight: 36,
    paddingVertical: 4,
  },
  tokenFaceOn: {
    backgroundColor: colors.raisedFace,
  },
  spriteIdle: {
    opacity: 0.6,
  },
  tabLabel: {
    fontSize: type.body,
    textAlign: "center",
  },
  tabLabelOn: {
    fontWeight: "700",
  },
});
