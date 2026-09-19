import { Modal, StyleSheet, Text, View } from "react-native";
import { PrimaryButton } from "./PrimaryButton";
import { strings } from "../strings";
import { colors, radius, spacing, type } from "../theme";

export type FeedbackDeltas = {
  balance?: number;
  savings?: number;
  care?: number;
  mood?: number;
};

export type FeedbackModel = {
  deltas: FeedbackDeltas;
  cause: string;
  nextStep: string;
};

function DeltaRow({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={styles.row}>
      <Text aria-hidden style={styles.icon}>
        {icon}
      </Text>
      <Text style={styles.body}>{label}</Text>
    </View>
  );
}

export function FeedbackCard({
  model,
  onDismiss,
}: {
  model: FeedbackModel;
  onDismiss: () => void;
}) {
  const { deltas } = model;
  return (
    <Modal animationType="slide" transparent visible onRequestClose={onDismiss}>
      <View style={styles.backdrop} pointerEvents="box-none">
        <View style={styles.sheet}>
          {deltas.balance ? (
            <DeltaRow icon={strings.balanceIcon} label={strings.feedbackBalance(deltas.balance)} />
          ) : null}
          {deltas.savings ? (
            <DeltaRow icon={strings.savingsIcon} label={strings.feedbackSavings(deltas.savings)} />
          ) : null}
          {deltas.care ? (
            <DeltaRow icon={strings.careIcon} label={strings.feedbackCare(deltas.care)} />
          ) : null}
          {deltas.mood ? (
            <DeltaRow icon={strings.moodIcon} label={strings.feedbackMood(deltas.mood)} />
          ) : null}
          <Text style={styles.body}>{model.cause}</Text>
          <Text style={styles.body}>{model.nextStep}</Text>
          <PrimaryButton label={strings.gotIt} onPress={onDismiss} />
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
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.s,
  },
  icon: {
    fontSize: type.section,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
});
