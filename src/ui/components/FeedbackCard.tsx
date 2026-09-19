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
  cause?: string;
  nextStep?: string;
  chip?: string;
  tutorial?: boolean;
  confirm?: "gotIt" | "next";
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
  const tutorial = Boolean(model.tutorial);
  const confirm = model.confirm ?? "gotIt";

  return (
    <Modal
      animationType="fade"
      transparent
      visible
      onRequestClose={() => {
        if (!tutorial) onDismiss();
      }}
    >
      <View style={[styles.backdrop, tutorial ? styles.backdropDim : null]}>
        <View style={styles.sheet}>
          {model.chip ? (
            <View style={styles.chip}>
              <Text style={styles.chipLabel}>{model.chip}</Text>
            </View>
          ) : null}
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
          {model.cause ? <Text style={styles.body}>{model.cause}</Text> : null}
          {model.nextStep ? <Text style={styles.body}>{model.nextStep}</Text> : null}
          <PrimaryButton
            label={confirm === "next" ? strings.next : strings.gotIt}
            onPress={onDismiss}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.l,
  },
  backdropDim: {
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderRadius: radius.card,
    gap: spacing.s,
    maxWidth: 360,
    padding: spacing.l,
  },
  chip: {
    alignSelf: "flex-start",
    backgroundColor: colors.badgeFill,
    borderRadius: 12,
    paddingHorizontal: spacing.m,
    paddingVertical: spacing.s,
  },
  chipLabel: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
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
