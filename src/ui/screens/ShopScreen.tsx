import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import type { CatalogItemContent } from "../../data/content";
import type { DayState, SavingsView } from "../../data/repositories/gameRepository";
import { Pictogram } from "../components/Pictogram";
import { ScreenTitle } from "../components/ScreenTitle";
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
import { colors, font, minTarget, radius, spacing, type } from "../theme";
import { METERS } from "../../core/config";
import { billsForDay, itemMeterEffects, meterDeltaMap } from "../../core/economy";
import { confirmedLeftover, leftoverAfterTap } from "./planLeftover";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;
type Tab = "mandatory" | "optional";
type Phase =
  | { name: "list" }
  | { name: "item"; item: CatalogItemContent }
  | { name: "confirm"; item: CatalogItemContent }
  | { name: "confirmActiveGoalBuy"; item: CatalogItemContent };

function engineItem(item: CatalogItemContent) {
  return { id: item.id, kind: item.kind, price: item.price, effect: item.effect, also: item.also, once: item.once };
}

function meterWord(meter: "care" | "mood") {
  return meter === "care" ? strings.care : strings.mood;
}

function meterGlyph(meter: "care" | "mood") {
  return meter === "care" ? strings.careIcon : strings.moodIcon;
}

function feedsSatiety(item: CatalogItemContent) {
  return itemMeterEffects(item).some((effect) => effect.meter === "care");
}

function skipLine(item: CatalogItemContent) {
  const food = feedsSatiety(item);
  const meter = food ? strings.care : strings.mood;
  const delta = food ? METERS.missedFoodPenalty : METERS.missedOtherBillPenalty;
  return {
    meter: food ? ("care" as const) : ("mood" as const),
    delta,
    spoken: strings.shopSkipA11y(item.name, meter, delta, !food),
  };
}

function rowAnnouncement(item: CatalogItemContent, balance: number, flags: { due: boolean; goal: boolean; bought: boolean }) {
  const parts = [item.name, strings.shopPrice(item.price)];
  for (const effect of itemMeterEffects(item)) {
    parts.push(strings.shopMeterA11y(meterWord(effect.meter), effect.delta));
  }
  if (flags.due && !flags.bought) parts.push(skipLine(item).spoken);
  if (flags.goal) parts.push(strings.shopGoalChip);
  if (flags.bought) parts.push(strings.shopBought);
  if (item.once) parts.push(strings.shopOnceChip);
  if (balance < item.price) parts.push(strings.shopShortfall(item.price - balance));
  return parts.join(". ");
}

function CoinPrice({ amount }: { amount: number }) {
  return (
    <View style={styles.price}>
      <Text style={styles.priceNumber}>{amount}</Text>
      <Pictogram glyph={strings.balanceIcon} />
    </View>
  );
}

function ItemHead({ item, shortfall }: { item: CatalogItemContent; shortfall: number | null }) {
  return (
    <View style={styles.itemTop}>
      <Text {...hiddenFromReader} style={styles.emoji}>
        {item.icon}
      </Text>
      <Text style={[styles.section, styles.name]}>{item.name}</Text>
      <View style={styles.priceCol}>
        <CoinPrice amount={item.price} />
        {shortfall != null ? <Text style={styles.body}>{strings.shopShortfall(shortfall)}</Text> : null}
      </View>
    </View>
  );
}

function EffectChips({
  item,
  due,
  bought,
  announce,
}: {
  item: CatalogItemContent;
  due: boolean;
  bought: boolean;
  announce: boolean;
}) {
  const skip = due && !bought ? skipLine(item) : null;
  return (
    <View style={styles.chips} {...(announce ? {} : hiddenFromReader)}>
      {itemMeterEffects(item).map((effect) => {
        const spoken = strings.shopMeterA11y(meterWord(effect.meter), effect.delta);
        return (
          <View key={effect.meter} style={styles.chip} accessible={announce} accessibilityLabel={announce ? spoken : undefined}>
            <Pictogram glyph={meterGlyph(effect.meter)} />
            <Text style={styles.chipText}>{strings.shopMeterDelta(effect.delta)}</Text>
          </View>
        );
      })}
      {skip ? (
        <View style={styles.chip} accessible={announce} accessibilityLabel={announce ? skip.spoken : undefined}>
          <Pictogram glyph={meterGlyph(skip.meter)} />
          <Text style={styles.chipText}>{strings.shopSkipDelta(skip.delta)}</Text>
        </View>
      ) : null}
    </View>
  );
}

function StateChips({
  goal,
  bought,
  once,
  hidden,
}: {
  goal: boolean;
  bought: boolean;
  once: boolean;
  hidden?: boolean;
}) {
  if (!goal && !bought && !once) return null;
  return (
    <View style={styles.chips} {...(hidden ? hiddenFromReader : {})}>
      {goal ? <StateChip label={strings.shopGoalChip} /> : null}
      {bought ? <StateChip label={strings.shopBought} icon={strings.selectedCheck} /> : null}
      {once ? <StateChip label={strings.shopOnceChip} /> : null}
    </View>
  );
}

const hiddenFromReader = {
  "aria-hidden": true as const,
  accessibilityElementsHidden: true as const,
  importantForAccessibility: "no-hide-descendants" as const,
};

function StateChip({ label, icon }: { label: string; icon?: string }) {
  return (
    <View style={styles.chip}>
      {icon ? <Pictogram glyph={icon} /> : null}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

export default function ShopScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const { setTab: setPlayTab, focus } = usePlayChrome();
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

  useEffect(() => {
    if (focus?.kind === "shop-bills") setTab("mandatory");
  }, [focus]);

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

  const backToList = () => {
    setWaiting(false);
    setPhase({ name: "list" });
  };

  const activeKey = savings?.activeGoal?.key ?? null;
  const pot = savings?.pot ?? 0;
  const dueIds = new Set(day ? billsForDay(day.n, content.bills).items : []);

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
      setPhase({ name: "item", item });
      setWaiting(false);
      return;
    }
    load();
    setPhase({ name: "list" });
    setOfferPickGoal(wasActiveGoal);
    setFeedback({
      deltas: {
        balance: -item.price,
        ...meterDeltaMap(item),
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
      setPhase({ name: "item", item });
      return;
    }
    load();
    setPhase({ name: "list" });
    setOfferPickGoal(true);
    setFeedback({
      deltas: {
        savings: -item.price,
        ...meterDeltaMap(item),
      },
      cause: strings.feedbackCausePurchase,
      nextStep: strings.feedbackNextPurchase,
    });
  };

  const requestBuy = (item: CatalogItemContent) => {
    if (activeKey === item.id) {
      setPhase({ name: "confirmActiveGoalBuy", item });
      return;
    }
    setPhase({ name: "confirm", item });
  };

  const itemActions = (item: CatalogItemContent): ReactNode => {
    const isActive = activeKey === item.id;
    const canPayBalance = balance >= item.price;
    const canPayPot = isActive && pot >= item.price;
    if (canPayBalance) {
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={backToList} />
          {canPayPot ? <TextButton label={strings.shopBuy} onPress={() => requestBuy(item)} /> : null}
          {canPayPot ? (
            <PrimaryButton label={strings.shopBuyFromSavings} onPress={() => buyFromSavings(item)} />
          ) : (
            <PrimaryButton label={strings.shopBuy} onPress={() => requestBuy(item)} />
          )}
        </>
      );
    }
    const gold = canPayPot ? (
      <PrimaryButton label={strings.shopBuyFromSavings} onPress={() => buyFromSavings(item)} />
    ) : isActive ? (
      <PrimaryButton label={strings.gotIt} onPress={backToList} />
    ) : (
      <PrimaryButton label={strings.shopPostpone} onPress={backToList} />
    );
    return (
      <>
        <TextButton label={strings.shopWaitAllowance} onPress={() => setWaiting(true)} />
        <TextButton label={strings.shopDoTask} onPress={openMap} />
        {canPayPot ? <TextButton label={strings.gotIt} onPress={backToList} /> : null}
        {gold}
      </>
    );
  };

  const footer = (() => {
    if (phase.name === "item") return itemActions(phase.item);
    if (phase.name === "confirm" || phase.name === "confirmActiveGoalBuy") {
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={backToList} />
          <PrimaryButton label={strings.shopBuy} onPress={() => buy(phase.item)} />
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
      <ScreenTitle style={styles.title}>{strings.navShop}</ScreenTitle>
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
            const shortfall = balance < item.price ? item.price - balance : null;
            const flags = {
              due: dueIds.has(item.id),
              goal: activeKey === item.id,
              bought: bought.includes(item.id),
            };
            const marked = focus?.kind === "shop-bills" && flags.due && !flags.bought;
            return (
              <Pressable
                key={item.id}
                role="button"
                aria-label={rowAnnouncement(item, balance, flags)}
                aria-selected={marked}
                onPress={() => {
                  setWaiting(false);
                  setPhase({ name: "item", item });
                }}
                style={[styles.itemHit, marked ? styles.itemMarked : null]}
              >
                <Card>
                  <ItemHead item={item} shortfall={shortfall} />
                    <EffectChips item={item} due={flags.due} bought={flags.bought} announce={false} />
                    <StateChips goal={flags.goal} bought={flags.bought} once={Boolean(item.once)} hidden />
                </Card>
              </Pressable>
            );
          })}
        </>
      ) : null}
      {phase.name === "item" ? (
        <Card>
          <ItemHead item={phase.item} shortfall={null} />
          <Text style={styles.body}>{phase.item.description}</Text>
          <EffectChips
            item={phase.item}
            due={dueIds.has(phase.item.id)}
            bought={bought.includes(phase.item.id)}
            announce
          />
          <StateChips
            goal={activeKey === phase.item.id}
            bought={bought.includes(phase.item.id)}
            once={Boolean(phase.item.once)}
          />
          {balance >= phase.item.price ? (
            <Text style={styles.body}>{strings.shopAfterBuy(balance - phase.item.price)}</Text>
          ) : (
            <Text style={styles.body}>{strings.shopShortfall(phase.item.price - balance)}</Text>
          )}
          {phase.item.once ? <Text style={styles.body}>{strings.shopOnceLabel}</Text> : null}
          {balance < phase.item.price && activeKey === phase.item.id ? (
            <Text style={styles.body}>{strings.shopBlockedAlreadyGoal}</Text>
          ) : null}
          {waiting && balance < phase.item.price ? <Text style={styles.body}>{strings.shopWaitExplain}</Text> : null}
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
  name: {
    flex: 1,
  },
  itemTop: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.s,
  },
  priceCol: {
    alignItems: "flex-end",
    gap: spacing.s,
  },
  price: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  priceNumber: {
    color: colors.text,
    fontFamily: font.pixel,
    fontSize: 16,
    fontWeight: "400",
    includeFontPadding: false,
    lineHeight: 24,
  },
  emoji: {
    fontSize: 24,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  chip: {
    alignItems: "center",
    backgroundColor: colors.badgeFill,
    borderRadius: radius.card,
    flexDirection: "row",
    gap: spacing.s,
    minHeight: 32,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  chipText: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.s,
  },
  itemHit: {
    minHeight: minTarget,
  },
  itemMarked: {
    backgroundColor: colors.highlight,
    borderRadius: radius.card,
  },
});
