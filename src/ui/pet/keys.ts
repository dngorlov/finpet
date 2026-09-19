export const SPECIES_KEYS = ["sp1", "sp2", "sp3"] as const;
export const COLOR_KEYS = ["c1", "c2", "c3"] as const;
export const ACCESSORY_KEYS = ["a1", "a2", "a3"] as const;

export type SpeciesKey = (typeof SPECIES_KEYS)[number];
export type ColorKey = (typeof COLOR_KEYS)[number];
export type AccessoryKey = (typeof ACCESSORY_KEYS)[number];
export type PetPose = "idle" | "happy" | "sad";

/** Pose from meters (M2 spec; not settled in ROADMAP). */
export function poseFromMeters(care: number, mood: number): PetPose {
  if (care < 30 || mood < 30) return "sad";
  if (care >= 70 && mood >= 70) return "happy";
  return "idle";
}
