/** Stable keys shared by persistence and first-run session routing. */
export const META_KEYS = {
  activeProfileId: "activeProfileId",
  onboardingDone: "onboardingDone",
  childProfileId: "childProfileId",
  demoProfileId: "demoProfileId",
  /** Device-wide громкость, 0–100. Missing means the default in `readSoundVolume`. */
  soundVolume: "soundVolume",
} as const;
