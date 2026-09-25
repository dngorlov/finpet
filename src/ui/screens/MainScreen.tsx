import { useCallback, useEffect, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BANK, ECONOMY } from "../../core/config";
import { META_KEYS } from "../../data/metaKeys";
import type { DayState, ProfileView, SavingsView } from "../../data/repositories/gameRepository";
import { Card } from "../components/Card";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import type { MoneySection } from "../navigation/playChrome";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { PetView } from "../pet/PetView";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import BankScreen from "./BankScreen";
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
  bankOpen: boolean;
};

const HUB_PET_SIZE = 200;

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
  const [menuOpen, setMenuOpen] = useState(false);

  const loadHub = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const opened = game.openDay(profileId);
    const bank = opened.status === "opened" ? game.collectDeposits(profileId, opened.dayId) : null;
    const profile = game.getProfile(profileId);
    const progress = game.listTaskProgress(profileId);
    const bankOpen =
      profile.isDemo || progress.some((row) => row.taskKey === BANK.unlockTaskId && row.status === "completed");
    const savings = game.savingsState(profileId);
    const day = game.dayState(profileId);
    const activeGoal = savings.activeGoal;
    const goalItem = activeGoal
      ? content.catalog.find((item) => item.id === activeGoal.key && item.kind === "optional")
      : undefined;
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
        if (tab === "home") {
          BackHandler.exitApp();
          return true;
        }
        setMenuOpen(false);
        setTab("home");
        return true;
      });
      return () => subscription.remove();
    }, [setTab, tab]),
  );

  useEffect(() => {
    if (money === "bank" && hub && !hub.bankOpen) setMoney("savings");
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
  const planMarked = hub.day.open && hub.day.plan.status !== "confirmed";
  const planHint = !hub.day.open ? null : planMarked ? strings.composePlanHint : strings.planReady;
  const options = MONEY_OPTIONS.filter((option) => option.id !== "bank" || hub.bankOpen);
  const current = options.find((option) => option.id === money) ?? options[0];

  return (
    <View style={styles.shell}>
      <StatusStrip />
      <View style={styles.bodySlot}>
        {tab === "home" ? (
          <Screen>
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
            {hub.profile.isDemo ? <Text style={styles.body}>{strings.demoBanner}</Text> : null}
            {waiting ? <Text style={styles.body}>{strings.waitingBanner}</Text> : null}
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
            <PrimaryButton label={strings.tabResults} onPress={() => navigation.navigate("Results")} />
            <PrimaryButton
              label={strings.navShop}
              disabled={waiting}
              accessibilityHint={waiting ? strings.waitingEconomyHint : undefined}
              onPress={() => navigation.navigate("Shop")}
            />
          </Screen>
        ) : null}
        {tab === "map" ? <TaskListScreen /> : null}
        {tab === "money" ? (
          <View style={styles.money}>
            <Pressable
              role="button"
              aria-label={strings.moneyMenu}
              aria-expanded={menuOpen}
              onPress={() => setMenuOpen((open) => !open)}
              style={styles.menuTrigger}
            >
              <Text style={styles.cardTitle}>{current.label}</Text>
            </Pressable>
            {menuOpen ? (
              <View>
                {options.map((option) => (
                  <Pressable
                    key={option.id}
                    role="button"
                    aria-label={option.label}
                    aria-selected={option.id === "plan" ? planMarked : option.id === money}
                    onPress={() => {
                      setMoney(option.id);
                      setMenuOpen(false);
                    }}
                    style={styles.menuRow}
                  >
                    <Text style={styles.body}>{option.label}</Text>
                    {option.id === "plan" && planMarked ? <Text style={styles.body}>{strings.selectedCheck}</Text> : null}
                    {option.id === "plan" && planHint ? <Text style={styles.body}>{planHint}</Text> : null}
                  </Pressable>
                ))}
              </View>
            ) : null}
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
      <View style={styles.tabs}>
        {(
          [
            ["home", strings.tabHome],
            ["map", strings.tabMap],
            ["money", strings.tabMoney],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            role="button"
            aria-label={label}
            aria-selected={tab === id}
            onPress={() => {
              if (id !== "money") setMenuOpen(false);
              setTab(id);
            }}
            style={styles.tab}
          >
            <Text style={tab === id ? styles.tabOn : styles.body}>{label}</Text>
          </Pressable>
        ))}
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
  bodySlot: {
    flex: 1,
  },
  money: {
    flex: 1,
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
  menuTrigger: {
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  menuRow: {
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  tabs: {
    borderTopColor: colors.track,
    borderTopWidth: 1,
    flexDirection: "row",
  },
  tab: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: minTarget,
  },
  tabOn: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
});
