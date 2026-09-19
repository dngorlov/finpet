import { Image, StyleSheet, View } from "react-native";
import { strings } from "../strings";
import { poseFromMeters, type PetPose } from "./keys";
import { petBaseSource, petOverlaySource } from "./assets";

export function PetView({
  species,
  color,
  accessory,
  petName,
  care,
  mood,
  pose,
  accessibilityHidden = false,
}: {
  species: string;
  color: string;
  accessory: string;
  petName?: string;
  care?: number;
  mood?: number;
  pose?: PetPose;
  accessibilityHidden?: boolean;
}) {
  const resolved: PetPose =
    pose ?? (care !== undefined && mood !== undefined ? poseFromMeters(care, mood) : "idle");
  return (
    <View
      accessible={!accessibilityHidden}
      role={accessibilityHidden ? undefined : "img"}
      aria-hidden={accessibilityHidden}
      aria-label={
        accessibilityHidden
          ? undefined
          : strings.petA11y({ petName, species, color, accessory, pose: resolved })
      }
      style={styles.frame}
    >
      <Image source={petBaseSource(species, color, resolved)} style={styles.layer} />
      <Image source={petOverlaySource(accessory)} style={styles.layer} />
    </View>
  );
}

const SIZE = 120;

const styles = StyleSheet.create({
  frame: {
    height: SIZE,
    width: SIZE,
  },
  layer: {
    bottom: 0,
    height: SIZE,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: SIZE,
  },
});
