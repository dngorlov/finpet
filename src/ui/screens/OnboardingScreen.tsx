import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "../navigation/types";
import { AppButton } from "../components/AppButton";
import { useSession } from "../session/SessionProvider";
import { strings } from "../strings";
import { colors, minTarget, spacing, type } from "../theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation, route }: Props) {
  const { content } = useSession();
  const replay = Boolean(route.params?.replay);
  const [index, setIndex] = useState(0);
  const card = content.hints[index];
  if (!card) return null;

  const finish = () => {
    if (replay) {
      navigation.goBack();
      return;
    }
    navigation.navigate("ProfileSetup");
  };

  const start = () => {
    if (index < content.hints.length - 1) {
      setIndex(index + 1);
      return;
    }
    finish();
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>{card.title}</Text>
      <Text style={styles.body}>{card.body}</Text>
      <View style={styles.dots}>
        {content.hints.map((hint, i) => (
          <Pressable
            key={hint.id}
            role="button"
            aria-label={strings.cardDot(i + 1)}
            aria-selected={i === index}
            onPress={() => setIndex(i)}
            style={[styles.dot, i === index ? styles.dotOn : null]}
          />
        ))}
      </View>
      <AppButton label={strings.start} onPress={start} />
      <AppButton label={strings.skip} onPress={finish} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
    flex: 1,
    gap: spacing.m,
    justifyContent: "center",
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
  dots: {
    flexDirection: "row",
    gap: spacing.s,
  },
  dot: {
    backgroundColor: colors.track,
    borderRadius: 8,
    height: minTarget / 3,
    minHeight: minTarget,
    minWidth: minTarget,
    width: minTarget / 3,
  },
  dotOn: {
    backgroundColor: colors.accent,
  },
});
