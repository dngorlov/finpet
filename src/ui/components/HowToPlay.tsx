import { useEffect, useState } from "react";
import { BackHandler, StyleSheet, Text, View } from "react-native";
import type { HintCardContent } from "../../data/content";
import { PetView } from "../pet/PetView";
import { strings } from "../strings";
import { colors, spacing, type } from "../theme";
import { PrimaryButton } from "./PrimaryButton";
import { Screen } from "./Screen";
import { SpeechBubble } from "./SpeechBubble";
import { TextButton } from "./TextButton";

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
    <Screen
      footer={
        <>
          <TextButton label={strings.back} onPress={goBack} />
          <PrimaryButton
            label={last ? (replay ? strings.done : strings.play) : strings.next}
            disabled={busy}
            onPress={next}
          />
          <TextButton
            label={replay ? strings.close : strings.skip}
            disabled={busy}
            onPress={onClose}
          />
        </>
      }
    >
      <Text style={styles.title}>{strings.howToPlay}</Text>
      <Text style={styles.step}>{strings.howToPlayStep(index + 1, cards.length)}</Text>
      <View style={styles.speaker}>
        <PetView
          species={pet.species}
          color={pet.color}
          accessory={pet.accessory}
          petName={pet.petName}
          pose="idle"
          accessibilityHidden
        />
        <Text style={styles.petName}>{pet.petName}</Text>
        <SpeechBubble accessibilityLabel={strings.petSays(pet.petName, card.body)}>
          <Text style={styles.body}>{card.body}</Text>
        </SpeechBubble>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    color: colors.text,
    fontSize: type.title,
    fontWeight: "700",
    textAlign: "center",
  },
  step: {
    color: colors.subtle,
    fontSize: type.body,
    textAlign: "center",
  },
  speaker: {
    alignItems: "center",
    alignSelf: "stretch",
    gap: spacing.m,
  },
  petName: {
    color: colors.text,
    fontSize: type.body,
    fontWeight: "700",
  },
  body: {
    color: colors.text,
    fontSize: type.body,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.s,
    justifyContent: "center",
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
});
