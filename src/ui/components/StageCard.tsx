import { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { STAGE_NAMES, type Stage } from "../../core/stages";
import { strings } from "../strings";
import { font, minTarget, spacing } from "../theme";

/** ISO/IEC 7810 ID-1. Width / height. */
const CARD_RATIO = 85.6 / 53.98;

function cardSize(width: number) {
  const cardWidth = Math.max(width - spacing.m * 2, minTarget);
  return { cardWidth, cardHeight: cardWidth / CARD_RATIO };
}

function tuckedOffset(cardHeight: number) {
  return Math.max(cardHeight - minTarget, 0);
}

type FaceKind = "sticker" | "sport" | "metal";

type Face = {
  background: string;
  band: string;
  ink: string;
  accent: string;
  radius: number;
  fontFamily: string;
  kind: FaceKind;
};

const FACES: Record<Stage, Face> = {
  novice: {
    background: "#7EC8E3",
    band: "#FFF6E4",
    ink: "#14324A",
    accent: "#2B8CB8",
    radius: 28,
    fontFamily: font.novice,
    kind: "sticker",
  },
  pro: {
    background: "#10243F",
    band: "#10243F",
    ink: "#E7FF57",
    accent: "#C6F135",
    radius: 0,
    fontFamily: font.pro,
    kind: "sport",
  },
  millionaire: {
    background: "#141414",
    band: "#141414",
    ink: "#F4E7C5",
    accent: "#C6A36A",
    radius: 14,
    fontFamily: font.millionaire,
    kind: "metal",
  },
};

export function StageCard({
  stage,
  open,
  onOpen,
  onClose,
}: {
  stage: Stage;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const { width } = useWindowDimensions();
  const face = FACES[stage];
  const name = STAGE_NAMES[stage];
  const { cardHeight } = cardSize(width);
  const [slide] = useState(
    () => new Animated.Value(tuckedOffset(cardSize(Dimensions.get("window").width).cardHeight)),
  );

  useEffect(() => {
    if (!open) return;
    slide.setValue(tuckedOffset(cardHeight));
    Animated.timing(slide, {
      toValue: 0,
      duration: 240,
      useNativeDriver: true,
    }).start();
  }, [cardHeight, open, slide]);

  return (
    <>
      <View
        accessibilityElementsHidden={open}
        importantForAccessibility={open ? "no-hide-descendants" : "auto"}
        style={[styles.peekClip, { borderRadius: face.radius }]}
      >
        <Pressable
          role="button"
          aria-label={strings.stageA11y(name)}
          onPress={onOpen}
          style={[styles.face, faceShell(face), { height: cardHeight }]}
        >
          <CardFace face={face} name={name} />
        </Pressable>
      </View>
      {open ? (
        <Pressable
          role="button"
          aria-label={strings.sheetClose}
          onPress={onClose}
          style={styles.scrim}
        />
      ) : null}
      {open ? (
        <Animated.View
          style={[
            styles.openCard,
            faceShell(face),
            { height: cardHeight, transform: [{ translateY: slide }] },
          ]}
        >
          <CardFace face={face} name={name} />
          <Pressable
            role="button"
            aria-label={strings.close}
            onPress={onClose}
            style={styles.close}
          >
            <Cross color={face.ink} />
          </Pressable>
        </Animated.View>
      ) : null}
    </>
  );
}

function faceShell(face: Face) {
  return {
    backgroundColor: face.background,
    borderColor: face.accent,
    borderRadius: face.radius,
    borderWidth: face.kind === "metal" ? 1 : 0,
  };
}

function CardFace({ face, name }: { face: Face; name: string }) {
  return (
    <View style={styles.face}>
      <View style={[styles.band, { backgroundColor: face.band }]}>
        <Text
          numberOfLines={1}
          adjustsFontSizeToFit
          style={[styles.title, { color: face.ink, fontFamily: face.fontFamily }]}
        >
          {name}
        </Text>
      </View>
      <Ornament face={face} />
    </View>
  );
}

function Ornament({ face }: { face: Face }) {
  if (face.kind === "sticker") {
    return (
      <View aria-hidden style={styles.ornament}>
        <Chip color={face.accent} />
        <View style={styles.dots}>
          {["a", "b", "c", "d", "e"].map((key) => (
            <View key={key} style={[styles.dot, { backgroundColor: face.accent }]} />
          ))}
        </View>
      </View>
    );
  }
  if (face.kind === "sport") {
    return (
      <View aria-hidden style={styles.ornament}>
        <Chip color={face.accent} sharp />
        <View style={styles.stripes}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.stripe, { backgroundColor: face.accent, left: 24 + index * 36 }]}
            />
          ))}
        </View>
      </View>
    );
  }
  return (
    <View aria-hidden style={styles.ornament}>
      <View style={[styles.hairline, { backgroundColor: face.accent }]} />
      <Chip color={face.accent} />
    </View>
  );
}

function Chip({ color, sharp = false }: { color: string; sharp?: boolean }) {
  return (
    <View style={[styles.chip, sharp ? styles.chipSharp : null, { borderColor: color }]}>
      <View style={[styles.chipLine, { backgroundColor: color }]} />
    </View>
  );
}

function Cross({ color }: { color: string }) {
  return (
    <View aria-hidden style={styles.cross}>
      <View style={[styles.crossBar, { backgroundColor: color, transform: [{ rotate: "45deg" }] }]} />
      <View style={[styles.crossBar, { backgroundColor: color, transform: [{ rotate: "-45deg" }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  peekClip: {
    height: minTarget,
    marginHorizontal: spacing.m,
    overflow: "hidden",
  },
  face: {
    flex: 1,
    overflow: "hidden",
  },
  band: {
    height: minTarget,
    justifyContent: "center",
    paddingHorizontal: minTarget,
  },
  title: {
    fontSize: 20,
    textAlign: "center",
  },
  ornament: {
    flex: 1,
    padding: spacing.m,
  },
  dots: {
    flexDirection: "row",
    gap: spacing.s,
    marginTop: spacing.m,
  },
  dot: {
    borderRadius: 8,
    height: 16,
    opacity: 0.85,
    width: 16,
  },
  stripes: {
    bottom: 0,
    left: 0,
    overflow: "hidden",
    position: "absolute",
    right: 0,
    top: 0,
  },
  stripe: {
    height: 180,
    opacity: 0.35,
    position: "absolute",
    top: -20,
    transform: [{ rotate: "-28deg" }],
    width: 14,
  },
  hairline: {
    height: 1,
    marginBottom: spacing.m,
    opacity: 0.9,
  },
  chip: {
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 4,
    width: 36,
  },
  chipSharp: {
    borderRadius: 0,
  },
  chipLine: {
    height: 2,
    opacity: 0.8,
  },
  scrim: {
    backgroundColor: "rgba(34, 26, 18, 0.45)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  openCard: {
    bottom: 0,
    left: spacing.m,
    overflow: "hidden",
    position: "absolute",
    right: spacing.m,
  },
  close: {
    alignItems: "center",
    height: minTarget,
    justifyContent: "center",
    position: "absolute",
    right: 0,
    top: 0,
    width: minTarget,
  },
  cross: {
    height: 18,
    width: 18,
  },
  crossBar: {
    borderRadius: 1,
    height: 2,
    left: 0,
    position: "absolute",
    top: 8,
    width: 18,
  },
});
