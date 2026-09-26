import { useMemo, useState } from "react";
import { Modal, ScrollView, StyleSheet, View } from "react-native";
import type { CatalogItemContent, GoalContent } from "../../data/content";
import type { JournalEntry } from "../../data/repositories/gameRepository";
import { META_KEYS } from "../../data/metaKeys";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, radius, spacing, type } from "../theme";
import { Chip } from "./Chip";
import { CoinText } from "./CoinText";
import { ScreenTitle } from "./ScreenTitle";
import { PrimaryButton } from "./PrimaryButton";
import { TextButton } from "./TextButton";

/** Lifetime `once` ownership: any journal purchase of a once catalog id (plus today's purchased ids). */
export function ownedOnceItemIds(
  journal: readonly JournalEntry[],
  catalog: readonly CatalogItemContent[],
  todayPurchasedIds: readonly string[] = [],
): Set<string> {
  const onceIds = new Set(catalog.filter((item) => item.once).map((item) => item.id));
  const owned = new Set<string>();
  for (const id of todayPurchasedIds) {
    if (onceIds.has(id)) owned.add(id);
  }
  for (const row of journal) {
    if (row.itemId && onceIds.has(row.itemId)) owned.add(row.itemId);
  }
  return owned;
}

export function settableOptionalItems(
  catalog: readonly CatalogItemContent[],
  ownedOnce: ReadonlySet<string>,
): CatalogItemContent[] {
  return catalog.filter((item) => item.kind === "optional" && !(item.once && ownedOnce.has(item.id)));
}

export function GoalPicker({
  visible,
  onClose,
  onChanged,
}: {
  visible: boolean;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const { game, meta, content } = useSession();
  const [pending, setPending] = useState<GoalContent | null>(null);

  const profileId = meta.get(META_KEYS.activeProfileId);
  const savings = profileId ? game.savingsState(profileId) : null;
  const pot = savings?.pot ?? 0;
  const activeKey = savings?.activeGoal?.key ?? null;

  const items = useMemo(() => {
    if (!profileId) return [];
    const stage = game.getProfile(profileId).stage;
    const day = game.dayState(profileId);
    const owned = new Set<string>([
      ...game.listJournal(profileId).map((row) => row.itemId).filter((id): id is string => Boolean(id)),
      ...game.purchasedItemIds(profileId, day.dayId),
    ]);
    return content.goals.filter((goal) => goal.stage === stage && !owned.has(goal.id));
    // `visible` is not read: it re-reads the journal each time the picker opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content.goals, game, profileId, visible]);

  const close = () => {
    setPending(null);
    onClose();
  };

  const apply = (item: GoalContent) => {
    if (!profileId) return;
    game.setActiveGoal(profileId, {
      id: item.id,
      kind: "optional",
      price: item.price,
      effect: item.effect,
      once: true,
      stage: item.stage,
    });
    setPending(null);
    onChanged?.();
    onClose();
  };

  const choose = (item: GoalContent) => {
    if (!profileId) return;
    if (activeKey && activeKey !== item.id) {
      setPending(item);
      return;
    }
    apply(item);
  };

  const drop = () => {
    if (!profileId) return;
    game.clearActiveGoal(profileId);
    setPending(null);
    onChanged?.();
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal animationType="slide" transparent visible onRequestClose={close}>
      <View style={styles.backdrop} pointerEvents="box-none">
        <View style={styles.sheet}>
          {pending ? (
            <>
              <ScreenTitle style={styles.title}>{strings.goalPickerTitle}</ScreenTitle>
              <CoinText coin text={strings.shopConfirmReplaceGoal(pending.name, pot)} style={styles.body} />
              <TextButton label={strings.close} onPress={() => setPending(null)} />
              <PrimaryButton label={strings.shopMakeGoal} onPress={() => apply(pending)} />
            </>
          ) : (
            <>
              <ScreenTitle style={styles.title}>{strings.goalPickerTitle}</ScreenTitle>
              <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
                {items.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    selected={activeKey === item.id}
                    onPress={() => choose(item)}
                  />
                ))}
              </ScrollView>
              <TextButton label={strings.goalDrop} onPress={drop} />
              <TextButton label={strings.close} onPress={close} />
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    gap: spacing.s,
    maxHeight: "80%",
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    gap: spacing.s,
    paddingVertical: spacing.s,
    minHeight: minTarget,
  },
});
