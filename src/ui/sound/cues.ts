/** Answer and mission cues. The files are original synthesis, not samples from another game. */
export type SoundCue = "correct" | "wrong" | "almost" | "complete";

/** Used when Настройки has never stored a level. Sounds start on. */
export const DEFAULT_SOUND_VOLUME = 80;

export const SOUND_VOLUME_STEP = 10;

export function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_SOUND_VOLUME;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/** `null` and junk mean the default. `"0"` stays muted. */
export function readSoundVolume(raw: string | null | undefined): number {
  if (raw == null || raw.trim() === "") return DEFAULT_SOUND_VOLUME;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed)) return DEFAULT_SOUND_VOLUME;
  return clampVolume(parsed);
}

export function stepVolume(value: number, direction: -1 | 1): number {
  return clampVolume(value + direction * SOUND_VOLUME_STEP);
}

/**
 * `good` celebrates, `bad` is the soft miss, `warn` («с ценой») is a short
 * in-between so a half-point answer is not silent and is not a fanfare.
 */
export function cueForVerdict(verdict: "good" | "warn" | "bad"): SoundCue {
  if (verdict === "good") return "correct";
  if (verdict === "warn") return "almost";
  return "wrong";
}
