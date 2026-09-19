import { useEffect, useState } from "react";
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { HintCardContent } from "../../data/content";
import { PetView } from "../pet/PetView";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";
import { PrimaryButton } from "./PrimaryButton";

type HowToPlayPet = {
  species: string;
  color: string;
  accessory: string;
  petName: string;
};

export function HowToPlay({
  cards,
  pet,
  replay,
  error,
  busy,
  onBack,
  onFinish,
  onClose,
}: {
  cards: readonly HintCardContent[];
  pet: HowToPlayPet;
  replay: boolean;
  error?: string | null;
  busy?: boolean;
  onBack: () => void;
  onFinish: () => void;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const card = cards[index];

  const goBack = () => {
    if (index > 0) {
      setIndex((current) => current - 1);
      return;
    }
    onBack();
  };

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      goBack();
      return true;
    });
    return () => subscription.remove();
  });

  if (!card) return null;

  const last = index === cards.length - 1;
  const next = () => {
    if (last) {
      onFinish();
      return;
    }
    setIndex((current) => current + 1);
  };

  return (
    <ScrollView contentContainerStyle={styles.screen}>
      <Text style={styles.title}>{strings.howToPlay}</Text>
      <Text style={styles.step}>{strings.howToPlayStep(index + 1, cards.length)}</Text>
      <PetView
        species={pet.species}
        color={pet.color}
        accessory={pet.accessory}
        petName={pet.petName}
        pose="idle"
        accessibilityHidden
      />
      <Text style={styles.petName}>{pet.petName}</Text>
      <View
        accessible
        aria-label={strings.petSays(pet.petName, card.body)}
        style={styles.bubble}
      >
        <Text style={styles.body}>{card.body}</Text>
      </View>
      <View aria-hidden style={styles.dots}>
        {cards.map((item, dotIndex) => (
          <View
            key={item.id}
            style={[styles.dot, dotIndex === index ? styles.dotOn : null]}
          />
        ))}
      </View>
      {error ? (
        <Text role="alert" style={styles.error}>
          {error}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <TextAction label={strings.back} onPress={goBack} />
        <PrimaryButton
          label={last ? (replay ? strings.done : strings.play) : strings.next}
          disabled={busy}
          onPress={next}
        />
        <TextAction
          label={replay ? strings.close : strings.skip}
          disabled={busy}
          onPress={onClose}
        />
      </View>
    </ScrollView>
  );
}

function TextAction({
  label,
  disabled,
  onPress,
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={Boolean(disabled)}
      disabled={disabled}
      onPress={onPress}
      style={styles.textAction}
    >
      <Text style={styles.textActionLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: "center",
    backgroundColor: colors.background,
    flexGrow: 1,
    gap: spacing.m,
    justifyContent: "center",
    padding: spacing.l,
  },
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
  },
  step: {
    color: colors.subtle,
    fontSize: type.body,
  },
  petName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  bubble: {
    alignSelf: "stretch",
    backgroundColor: colors.card,
    borderColor: colors.track,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.m,
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.s,
  },
  dot: {
    backgroundColor: colors.track,
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  dotOn: {
    backgroundColor: colors.accent,
  },
  error: {
    color: colors.text,
    fontSize: type.body,
  },
  actions: {
    alignSelf: "stretch",
    gap: spacing.s,
  },
  textAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: minTarget,
    paddingHorizontal: spacing.m,
  },
  textActionLabel: {
    color: colors.accent,
    fontSize: type.body,
    fontWeight: "700",
  },
});
