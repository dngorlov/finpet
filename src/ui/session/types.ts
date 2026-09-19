import type { GameContent } from "../../data/content";
import type {
  CreateProfileInput,
  OpenDayResult,
  ProfileView,
  SavingsView,
} from "../../data/repositories/gameRepository";

export type { ProfileView, SavingsView };

/** UI-facing slice of the game repository — the persistence seam M2 tests fake. */
export type SessionGame = {
  createProfile(input: CreateProfileInput): string;
  getProfile(profileId: string): ProfileView;
  openDay(profileId: string): OpenDayResult;
  savingsState(profileId: string): SavingsView;
};

export type SessionMeta = {
  get(key: string): string | null;
  set(key: string, value: string): void;
};

export type SessionPorts = {
  game: SessionGame;
  meta: SessionMeta;
  content: GameContent;
};
