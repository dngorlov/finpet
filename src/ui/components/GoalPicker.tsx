import { useState } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import type { CatalogItemContent } from "../../data/content";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";
import { Chip } from "./Chip";
import { PrimaryButton } from "./PrimaryButton";
import { TextButton } from "./TextButton";

export type GoalPickerProps = {
  items: CatalogItemContent[];
  activeGoalId: string | null;
  pot: number;
  onChoose: (item: CatalogItemContent) => void;
  onDrop?: () => void;
  onClose: () => void;
};

/** Shared «Выбери цель» overlay for Копилка, Магазин, and post-buy. */
export function GoalPicker({ items, activeGoalId, pot, onChoose, onDrop, onClose }: GoalPickerProps) {
  const [pending, setPending] = useState<CatalogItemContent | null>(null);

  const choose = (item: CatalogItemContent) => {
    if (activeGoalId && activeGoalId !== item.id) {
      setPending(item);
      return;
    }
    onChoose(item);
  };

  return (
    <Modal animationType="slide" transparent visible onRequestClose={onClose}>
      <View style={styles.backdrop} pointerEvents="box-none">
        <View style={styles.sheet}>
          {pending ? (
            <>
              <Text style={styles.section}>{strings.savingsChooseGoal}</Text>
              <Text style={styles.body}>{strings.savingsConfirmReplace(pending.name, pot)}</Text>
              <TextButton label={strings.close} onPress={() => setPending(null)} />
              <PrimaryButton
                label={strings.done}
                onPress={() => {
                  const item = pending;
                  setPending(null);
                  onChoose(item);
                }}
              />
            </>
          ) : (
            <>
              <Text style={styles.section}>{strings.savingsChooseGoal}</Text>
              <View style={styles.list}>
                {items.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.name}
                    selected={item.id === activeGoalId}
                    onPress={() => choose(item)}
                  />
                ))}
              </View>
              {onDrop && activeGoalId ? (
                <TextButton label={strings.savingsDropGoal} onPress={onDrop} />
              ) : null}
              <TextButton label={strings.close} onPress={onClose} />
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
  },
  sheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.card,
    borderTopRightRadius: radius.card,
    gap: spacing.s,
    padding: spacing.l,
  },
  list: {
    gap: spacing.s,
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
});
