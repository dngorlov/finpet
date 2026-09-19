import type { ImageSourcePropType } from "react-native";
import type { AccessoryKey, PetPose } from "./keys";

const BASE: Record<string, ImageSourcePropType> = {
  "sp1/c1/idle": require("../../../assets/pets/sp1/c1/idle.png"),
  "sp1/c1/happy": require("../../../assets/pets/sp1/c1/happy.png"),
  "sp1/c1/sad": require("../../../assets/pets/sp1/c1/sad.png"),
  "sp1/c2/idle": require("../../../assets/pets/sp1/c2/idle.png"),
  "sp1/c2/happy": require("../../../assets/pets/sp1/c2/happy.png"),
  "sp1/c2/sad": require("../../../assets/pets/sp1/c2/sad.png"),
  "sp1/c3/idle": require("../../../assets/pets/sp1/c3/idle.png"),
  "sp1/c3/happy": require("../../../assets/pets/sp1/c3/happy.png"),
  "sp1/c3/sad": require("../../../assets/pets/sp1/c3/sad.png"),
  "sp2/c1/idle": require("../../../assets/pets/sp2/c1/idle.png"),
  "sp2/c1/happy": require("../../../assets/pets/sp2/c1/happy.png"),
  "sp2/c1/sad": require("../../../assets/pets/sp2/c1/sad.png"),
  "sp2/c2/idle": require("../../../assets/pets/sp2/c2/idle.png"),
  "sp2/c2/happy": require("../../../assets/pets/sp2/c2/happy.png"),
  "sp2/c2/sad": require("../../../assets/pets/sp2/c2/sad.png"),
  "sp2/c3/idle": require("../../../assets/pets/sp2/c3/idle.png"),
  "sp2/c3/happy": require("../../../assets/pets/sp2/c3/happy.png"),
  "sp2/c3/sad": require("../../../assets/pets/sp2/c3/sad.png"),
  "sp3/c1/idle": require("../../../assets/pets/sp3/c1/idle.png"),
  "sp3/c1/happy": require("../../../assets/pets/sp3/c1/happy.png"),
  "sp3/c1/sad": require("../../../assets/pets/sp3/c1/sad.png"),
  "sp3/c2/idle": require("../../../assets/pets/sp3/c2/idle.png"),
  "sp3/c2/happy": require("../../../assets/pets/sp3/c2/happy.png"),
  "sp3/c2/sad": require("../../../assets/pets/sp3/c2/sad.png"),
  "sp3/c3/idle": require("../../../assets/pets/sp3/c3/idle.png"),
  "sp3/c3/happy": require("../../../assets/pets/sp3/c3/happy.png"),
  "sp3/c3/sad": require("../../../assets/pets/sp3/c3/sad.png"),
};

const OVERLAY: Record<AccessoryKey, ImageSourcePropType> = {
  a1: require("../../../assets/pets/overlays/a1.png"),
  a2: require("../../../assets/pets/overlays/a2.png"),
  a3: require("../../../assets/pets/overlays/a3.png"),
};

export function petBaseSource(species: string, color: string, pose: PetPose): ImageSourcePropType {
  return BASE[`${species}/${color}/${pose}`] ?? BASE["sp1/c1/idle"];
}

export function petOverlaySource(accessory: string): ImageSourcePropType {
  return OVERLAY[accessory as AccessoryKey] ?? OVERLAY.a1;
}
