import { Image, StyleSheet, View } from "react-native";
import { strings } from "../strings";
import { poseFromMeters, type PetPose } from "./keys";
import { petBaseSource, petOverlaySource } from "./assets";

const DEFAULT_SIZE = 120;

export function PetView({
  species,
  color,
  accessory,
  petName,
  care,
  mood,
  pose,
  size = DEFAULT_SIZE,
  accessibilityHidden = false,
}: {
  species: string;
  color: string;
  accessory: string;
  petName?: string;
  care?: number;
  mood?: number;
  pose?: PetPose;
  size?: number;
  accessibilityHidden?: boolean;
}) {
  const resolved: PetPose =
    pose ?? (care !== undefined && mood !== undefined ? poseFromMeters(care, mood) : "idle");
  const box = { height: size, width: size };
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
      style={[styles.frame, box]}
    >
      <Image source={petBaseSource(species, color, resolved)} style={[styles.layer, box]} />
      <Image source={petOverlaySource(accessory)} style={[styles.layer, box]} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: DEFAULT_SIZE,
    width: DEFAULT_SIZE,
  },
  layer: {
    bottom: 0,
    height: DEFAULT_SIZE,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
    width: DEFAULT_SIZE,
  },
});
