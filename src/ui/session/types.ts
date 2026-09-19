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
  deleteProfile(profileId: string): void;
  openDay(profileId: string): OpenDayResult;
  savingsState(profileId: string): SavingsView;
};

export type SessionMeta = {
  get(key: string): string | null;
  set(key: string, value: string): void;
  remove(key: string): void;
};

export type SessionFirstRun = {
  complete(input: CreateProfileInput): string;
};

export type SessionPorts = {
  firstRun: SessionFirstRun;
  game: SessionGame;
  meta: SessionMeta;
  content: GameContent;
};
