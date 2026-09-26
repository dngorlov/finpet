import { useCallback, useEffect, useRef, useState } from "react";
import { BackHandler, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { BANK, FEATURES } from "../../core/config";
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
import { goalFace } from "../goalLabel";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { shopStrings } from "../stringsShop";
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
  goalName: string;
  goalIcon: string;
  threshold: string | null;
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
  const { tab, setTab, money, setMoney, revision, setGoalPrompt } = usePlayChrome();
  const [hub, setHub] = useState<HubModel | null>(null);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  const [cardOpen, setCardOpen] = useState(false);
  const [dayTip, setDayTip] = useState(false);
  const [dropBox, setDropBox] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const shellRef = useRef<View>(null);
  const dropRef = useRef<View>(null);
  const closeDayTip = useCallback(() => {
    setDropBox(null);
    setDayTip(false);
  }, []);
  const openGoal = useCallback(() => {
    setCardOpen(false);
    closeDayTip();
    setMoney("savings");
    setTab("money");
    setGoalPrompt(true);
  }, [closeDayTip, setGoalPrompt, setMoney, setTab]);
  const placeDropShield = useCallback(() => {
    const drop = dropRef.current;
    const shell = shellRef.current;
    if (!drop || !shell || typeof drop.measureLayout !== "function") return;
    drop.measureLayout(
      shell,
      (x, y, width, height) => {
        setDropBox((current) =>
          current && current.x === x && current.y === y && current.width === width && current.height === height
            ? current
            : { x, y, width, height },
        );
      },
      () => setDropBox(null),
    );
  }, []);

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
    const face = goalFace(savings, profile.stage, content.goals);
    const cost = activeGoal?.cost ?? 0;
    const remaining = activeGoal?.remaining ?? 0;
    setHub({
      profile,
      savings,
      day,
      goalName: face.name,
      goalIcon: face.icon,
      threshold: face.threshold,
      accumulated: cost - remaining,
      cost,
      remaining,
      savingsOpen,
      planOpen,
      bankOpen,
    });
    const bankPaid = bank && bank.paid > 0 ? bank : null;
    if (bankPaid) {
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
    // Re-read the hub from SQLite after a money action elsewhere bumps `revision`.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadHub();
  }, [loadHub, revision]);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
        if (dayTip) {
          closeDayTip();
          return true;
        }
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
    }, [cardOpen, closeDayTip, dayTip, setTab, tab]),
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
    <View ref={shellRef} style={styles.shell}>
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
                goalName={hub.goalName}
                goalIcon={hub.goalIcon}
                threshold={hub.threshold}
                accumulated={hub.accumulated}
                cost={hub.cost}
                canPickGoal={hub.savingsOpen}
                onPickGoal={openGoal}
                onShop={() => navigation.navigate("Shop")}
                onResults={() => navigation.navigate("Results")}
                dayTip={dayTip}
                onDayTip={(open) => (open ? setDayTip(true) : closeDayTip())}
                dropRef={dropRef}
                onDropLayout={placeDropShield}
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
          petName={hub.profile.petName}
          goalName={hub.goalName}
          goalIcon={hub.goalIcon}
          threshold={hub.threshold}
          accumulated={hub.accumulated}
          cost={hub.cost}
          open={cardOpen}
          onOpen={() => setCardOpen(true)}
          onClose={() => setCardOpen(false)}
          canPickGoal={hub.savingsOpen}
          onPickGoal={openGoal}
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
                  closeDayTip();
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
      {dayTip ? (
        <Pressable
          role="button"
          aria-label={shopStrings.dailyDropClose}
          aria-hidden
          onPress={closeDayTip}
          style={styles.dayTipScrim}
        />
      ) : null}
      {dayTip && dropBox ? (
        <View pointerEvents="box-none" style={styles.dayTipScrim}>
          <Pressable
            accessible={false}
            aria-hidden
            onPress={() => {}}
            style={{
              backgroundColor: "transparent",
              height: dropBox.height,
              left: dropBox.x,
              position: "absolute",
              top: dropBox.y,
              width: dropBox.width,
            }}
          />
        </View>
      ) : null}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    backgroundColor: colors.background,
    flex: 1,
  },
  dayTipScrim: {
    backgroundColor: "transparent",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
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
    backgroundColor: colors.track,
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
    backgroundColor: colors.track,
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
