import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import type { CatalogItemContent } from "../../data/content";
import type { DayState, SavingsView } from "../../data/repositories/gameRepository";
import { Badge } from "../components/Badge";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { GoalPicker, ownedOnceItemIds } from "../components/GoalPicker";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { StatusStrip } from "../components/StatusStrip";
import { TextButton } from "../components/TextButton";
import { usePlayChrome } from "../navigation/playChrome";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import { confirmedLeftover, leftoverAfterTap } from "./planLeftover";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;
type Tab = "mandatory" | "optional";
type Phase =
  | { name: "list" }
  | { name: "item"; item: CatalogItemContent }
  | { name: "confirm"; item: CatalogItemContent }
  | { name: "confirmActiveGoalBuy"; item: CatalogItemContent }
  | { name: "confirmReplaceGoal"; item: CatalogItemContent }
  | { name: "blocked"; item: CatalogItemContent; missing: number }
  | { name: "blockedAlreadyGoal"; item: CatalogItemContent; missing: number };

function engineItem(item: CatalogItemContent) {
  return { id: item.id, kind: item.kind, price: item.price, effect: item.effect, once: item.once };
}

export default function ShopScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const { setTab: setPlayTab } = usePlayChrome();
  const openMap = () => {
    setPlayTab("map");
    navigation.navigate("Main");
  };
  const [tab, setTab] = useState<Tab>("mandatory");
  const [day, setDay] = useState<DayState | null>(null);
  const [balance, setBalance] = useState(0);
  const [bought, setBought] = useState<string[]>([]);
  const [ownedOnce, setOwnedOnce] = useState<Set<string>>(new Set());
  const [savings, setSavings] = useState<SavingsView | null>(null);
  const [phase, setPhase] = useState<Phase>({ name: "list" });
  const [waiting, setWaiting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [offerPickGoal, setOfferPickGoal] = useState(false);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const next = game.dayState(profileId);
    const purchasedToday = game.purchasedItemIds(profileId, next.dayId);
    setDay(next);
    setBalance(next.available);
    setBought(purchasedToday);
    setSavings(game.savingsState(profileId));
    setOwnedOnce(ownedOnceItemIds(game.listJournal(profileId), content.catalog, purchasedToday));
  }, [content.catalog, game, meta]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const activeKey = savings?.activeGoal?.key ?? null;
  const pot = savings?.pot ?? 0;

  const items = content.catalog.filter((item) => {
    if (item.kind !== tab) return false;
    if (tab === "optional" && item.once && ownedOnce.has(item.id)) return false;
    return true;
  });
  const tabLeftover = confirmedLeftover(day, tab);
  const tabBucketLabel = tab === "mandatory" ? strings.bucketMandatory : strings.bucketOptional;
  const leftoverAfterBuy =
    phase.name === "confirm" || phase.name === "confirmActiveGoalBuy"
      ? leftoverAfterTap(confirmedLeftover(day, phase.item.kind), phase.item.price)
      : null;

  const buy = (item: CatalogItemContent) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    const wasActiveGoal = game.savingsState(profileId).activeGoal?.key === item.id;
    const result = game.purchase(profileId, day.dayId, engineItem(item));
    if (result.status === "blocked") {
      const stillActive = game.savingsState(profileId).activeGoal?.key === item.id;
      if (item.kind === "optional" && stillActive) {
        setPhase({ name: "blockedAlreadyGoal", item, missing: result.missing });
      } else {
        setPhase({ name: "blocked", item, missing: result.missing });
      }
      setWaiting(false);
      return;
    }
    load();
    setPhase({ name: "list" });
    setOfferPickGoal(wasActiveGoal);
    setFeedback({
      deltas: {
        balance: -item.price,
        care: item.effect.meter === "care" ? item.effect.delta : undefined,
        mood: item.effect.meter === "mood" ? item.effect.delta : undefined,
      },
      cause: strings.feedbackCausePurchase,
      nextStep: strings.feedbackNextPurchase,
    });
  };

  const buyFromSavings = (item: CatalogItemContent) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    const result = game.purchaseFromSavings(profileId, day.dayId, engineItem(item));
    if (result.status === "blocked") {
      setPhase({ name: "blocked", item, missing: result.missing });
      return;
    }
    load();
    setPhase({ name: "list" });
    setOfferPickGoal(true);
    setFeedback({
      deltas: {
        savings: -item.price,
        care: item.effect.meter === "care" ? item.effect.delta : undefined,
        mood: item.effect.meter === "mood" ? item.effect.delta : undefined,
      },
      cause: strings.feedbackCausePurchase,
      nextStep: strings.feedbackNextPurchase,
    });
  };

  const makeGoal = (item: CatalogItemContent) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const current = game.savingsState(profileId).activeGoal;
    if (current && current.key !== item.id) {
      setPhase({ name: "confirmReplaceGoal", item });
      return;
    }
    game.setActiveGoal(profileId, engineItem(item));
    load();
    setPhase({ name: "list" });
  };

  const confirmMakeGoal = (item: CatalogItemContent) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    game.setActiveGoal(profileId, engineItem(item));
    load();
    setPhase({ name: "list" });
  };

  const requestBuy = (item: CatalogItemContent) => {
    if (activeKey === item.id) {
      setPhase({ name: "confirmActiveGoalBuy", item });
      return;
    }
    setPhase({ name: "confirm", item });
  };

  const footer = (() => {
    if (phase.name === "item") {
      const isActive = activeKey === phase.item.id;
      const canBuyFromPot = isActive && pot >= phase.item.price;
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
          {phase.item.kind === "optional" && !isActive ? (
            <TextButton
              label={strings.shopMakeGoal}
              onPress={() => makeGoal(phase.item)}
            />
          ) : null}
          {canBuyFromPot ? (
            <PrimaryButton
              label={strings.shopBuyFromSavings}
              onPress={() => buyFromSavings(phase.item)}
            />
          ) : null}
          <PrimaryButton
            label={strings.shopBuy}
            onPress={() => requestBuy(phase.item)}
          />
        </>
      );
    }
    if (phase.name === "confirm" || phase.name === "confirmActiveGoalBuy") {
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
          <PrimaryButton label={strings.shopBuy} onPress={() => buy(phase.item)} />
        </>
      );
    }
    if (phase.name === "confirmReplaceGoal") {
      return (
        <>
          <TextButton label={strings.close} onPress={() => setPhase({ name: "list" })} />
          <PrimaryButton
            label={strings.shopMakeGoal}
            onPress={() => confirmMakeGoal(phase.item)}
          />
        </>
      );
    }
    if (phase.name === "blocked") {
      const optionalCta =
        phase.item.kind === "optional" ? (
          <PrimaryButton
            label={strings.shopMakeGoal}
            onPress={() => makeGoal(phase.item)}
          />
        ) : (
          <PrimaryButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
        );
      return (
        <>
          <TextButton label={strings.shopWaitAllowance} onPress={() => setWaiting(true)} />
          <TextButton
            label={strings.shopDoTask}
            onPress={openMap}
          />
          {optionalCta}
        </>
      );
    }
    if (phase.name === "blockedAlreadyGoal") {
      return (
        <>
          <TextButton label={strings.shopWaitAllowance} onPress={() => setWaiting(true)} />
          <TextButton
            label={strings.shopDoTask}
            onPress={openMap}
          />
          <PrimaryButton label={strings.gotIt} onPress={() => setPhase({ name: "list" })} />
        </>
      );
    }
    if (offerPickGoal && phase.name === "list" && !feedback) {
      return (
        <PrimaryButton
          label={strings.pickNewGoal}
          onPress={() => {
            setOfferPickGoal(false);
            setPickerOpen(true);
          }}
        />
      );
    }
    return null;
  })();

  return (
    <Screen header={<StatusStrip />} footer={footer}>
      <BackButton />
      <Text style={styles.title}>{strings.navShop}</Text>
      {phase.name === "list" ? (
        <>
          <View style={styles.tabs}>
            <Chip
              label={strings.shopMandatoryTab}
              pictogram={strings.navPlanPictogram}
              selected={tab === "mandatory"}
              onPress={() => {
                setTab("mandatory");
              }}
            />
            <Chip
              label={strings.shopOptionalTab}
              pictogram={strings.navShopPictogram}
              selected={tab === "optional"}
              onPress={() => {
                setTab("optional");
              }}
            />
          </View>
          {tabLeftover != null ? (
            <Text
              accessible
              aria-label={strings.planLeftoverA11y(tabBucketLabel, tabLeftover)}
              style={styles.body}
            >
              {tabLeftover >= 0 ? strings.planLeftover(tabLeftover) : strings.planOvershoot(Math.abs(tabLeftover))}
            </Text>
          ) : null}
          {items.map((item) => {
            const row = (
              <Pressable
                role="button"
                aria-label={item.name}
                onPress={() => {
                  setPhase({ name: "item", item });
                }}
                style={styles.itemHit}
              >
                <Card>
                  <Text style={styles.section}>{item.name}</Text>
                  <Text style={styles.body}>
                    {item.kind === "mandatory" ? strings.navPlanPictogram : strings.navShopPictogram}{" "}
                    {strings.shopCategory(item.kind)}
                  </Text>
                  <Text style={styles.body}>{strings.shopPrice(item.price)}</Text>
                  <Text style={styles.body}>
                    {item.effect.meter === "care" ? strings.careIcon : strings.moodIcon}{" "}
                    {strings.shopImpact(
                      item.effect.meter === "care" ? strings.care : strings.mood,
                      item.effect.delta,
                    )}
                  </Text>
                  <Text style={styles.body}>{strings.shopAfterBuy(balance - item.price)}</Text>
                  {item.once ? <Text style={styles.body}>{strings.shopOnceLabel}</Text> : null}
                  {bought.includes(item.id) ? (
                    <Badge icon={strings.selectedCheck} word={strings.shopBought} value="" />
                  ) : null}
                </Card>
              </Pressable>
            );
            return <View key={item.id}>{row}</View>;
          })}
        </>
      ) : null}
      {phase.name === "item" ? (
        <Card>
          <Text style={styles.section}>{phase.item.name}</Text>
          <Text style={styles.body}>{phase.item.description}</Text>
          <Text style={styles.body}>{strings.shopPrice(phase.item.price)}</Text>
          <Text style={styles.body}>
            {strings.shopImpact(
              phase.item.effect.meter === "care" ? strings.care : strings.mood,
              phase.item.effect.delta,
            )}
          </Text>
          {phase.item.once ? <Text style={styles.body}>{strings.shopOnceLabel}</Text> : null}
        </Card>
      ) : null}
      {phase.name === "confirm" ? (
        <Card>
          <Text style={styles.section}>{strings.shopConfirmBuy(phase.item.name, phase.item.price)}</Text>
          {leftoverAfterBuy != null ? (
            <>
              <Text style={styles.body}>{strings.planAfterTap(leftoverAfterBuy)}</Text>
              {leftoverAfterBuy < 0 ? <Text style={styles.body}>{strings.planOverWarn}</Text> : null}
            </>
          ) : null}
        </Card>
      ) : null}
      {phase.name === "confirmActiveGoalBuy" ? (
        <Card>
          <Text style={styles.section}>{strings.shopConfirmBuy(phase.item.name, phase.item.price)}</Text>
          <Text style={styles.body}>{strings.shopBuyActiveGoalWarn(pot)}</Text>
          {leftoverAfterBuy != null ? (
            <>
              <Text style={styles.body}>{strings.planAfterTap(leftoverAfterBuy)}</Text>
              {leftoverAfterBuy < 0 ? <Text style={styles.body}>{strings.planOverWarn}</Text> : null}
            </>
          ) : null}
        </Card>
      ) : null}
      {phase.name === "confirmReplaceGoal" ? (
        <Card>
          <Text style={styles.section}>{strings.shopConfirmReplaceGoal(phase.item.name, pot)}</Text>
        </Card>
      ) : null}
      {phase.name === "blocked" || phase.name === "blockedAlreadyGoal" ? (
        <Card>
          <Text style={styles.section}>{strings.shopBlocked(phase.missing)}</Text>
          {phase.name === "blockedAlreadyGoal" ? (
            <Text style={styles.body}>{strings.shopBlockedAlreadyGoal}</Text>
          ) : null}
          {waiting ? <Text style={styles.body}>{strings.shopWaitExplain}</Text> : null}
        </Card>
      ) : null}
      {feedback ? (
        <FeedbackCard
          model={feedback}
          onDismiss={() => {
            setFeedback(null);
          }}
        />
      ) : null}
      <GoalPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onChanged={load}
      />
    </Screen>
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
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  itemHit: {
    minHeight: minTarget,
  },
});
