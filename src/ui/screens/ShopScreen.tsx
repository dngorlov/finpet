import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { META_KEYS } from "../../data/metaKeys";
import type { CatalogItemContent } from "../../data/content";
import { Badge } from "../components/Badge";
import { BackButton } from "../components/BackButton";
import { Card } from "../components/Card";
import { Chip } from "../components/Chip";
import { FeedbackCard, type FeedbackModel } from "../components/FeedbackCard";
import { PrimaryButton } from "../components/PrimaryButton";
import { Screen } from "../components/Screen";
import { TextButton } from "../components/TextButton";
import type { RootStackParamList } from "../navigation/types";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Shop">;
type Tab = "mandatory" | "optional";
type Phase =
  | { name: "list" }
  | { name: "item"; item: CatalogItemContent }
  | { name: "confirm"; item: CatalogItemContent }
  | { name: "blocked"; item: CatalogItemContent; missing: number };

function engineItem(item: CatalogItemContent) {
  return { id: item.id, kind: item.kind, price: item.price, effect: item.effect };
}

export default function ShopScreen({ navigation }: Props) {
  const { game, meta, content } = useSession();
  const [tab, setTab] = useState<Tab>("mandatory");
  const [balance, setBalance] = useState(0);
  const [bought, setBought] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>({ name: "list" });
  const [waiting, setWaiting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackModel | null>(null);

  const load = useCallback(() => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    setBalance(day.available);
    setBought(game.purchasedItemIds(profileId, day.dayId));
  }, [game, meta]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const items = content.catalog.filter((item) => item.kind === tab);

  const buy = (item: CatalogItemContent) => {
    const profileId = meta.get(META_KEYS.activeProfileId);
    if (!profileId) return;
    const day = game.dayState(profileId);
    const result = game.purchase(profileId, day.dayId, engineItem(item));
    if (result.status === "blocked") {
      setPhase({ name: "blocked", item, missing: result.missing });
      setWaiting(false);
      return;
    }
    load();
    setPhase({ name: "list" });
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

  const footer = (() => {
    if (phase.name === "item") {
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
          <PrimaryButton label={strings.shopBuy} onPress={() => setPhase({ name: "confirm", item: phase.item })} />
        </>
      );
    }
    if (phase.name === "confirm") {
      return (
        <>
          <TextButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
          <PrimaryButton label={strings.shopBuy} onPress={() => buy(phase.item)} />
        </>
      );
    }
    if (phase.name === "blocked") {
      return (
        <>
          <TextButton label={strings.shopWaitAllowance} onPress={() => setWaiting(true)} />
          <TextButton
            label={strings.shopDoTask}
            onPress={() => navigation.navigate("TaskList")}
          />
          <PrimaryButton label={strings.shopPostpone} onPress={() => setPhase({ name: "list" })} />
        </>
      );
    }
    return null;
  })();

  return (
    <Screen footer={footer}>
      <BackButton />
      <Text style={styles.title}>{strings.navShop}</Text>
      {phase.name === "list" ? (
        <>
          <View style={styles.tabs}>
            <Chip
              label={strings.shopMandatoryTab}
              pictogram={strings.navPlanPictogram}
              selected={tab === "mandatory"}
              onPress={() => setTab("mandatory")}
            />
            <Chip
              label={strings.shopOptionalTab}
              pictogram={strings.navShopPictogram}
              selected={tab === "optional"}
              onPress={() => setTab("optional")}
            />
          </View>
          {items.map((item) => (
            <Pressable
              key={item.id}
              role="button"
              aria-label={item.name}
              onPress={() => setPhase({ name: "item", item })}
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
                {bought.includes(item.id) ? (
                  <Badge icon={strings.selectedCheck} word={strings.shopBought} value="" />
                ) : null}
              </Card>
            </Pressable>
          ))}
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
        </Card>
      ) : null}
      {phase.name === "confirm" ? (
        <Card>
          <Text style={styles.section}>{strings.shopConfirmBuy(phase.item.name, phase.item.price)}</Text>
        </Card>
      ) : null}
      {phase.name === "blocked" ? (
        <Card>
          <Text style={styles.section}>{strings.shopBlocked(phase.missing)}</Text>
          {waiting ? <Text style={styles.body}>{strings.shopWaitExplain}</Text> : null}
        </Card>
      ) : null}
      {feedback ? <FeedbackCard model={feedback} onDismiss={() => setFeedback(null)} /> : null}
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
