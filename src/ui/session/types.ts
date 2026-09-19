import type { CatalogItem, PlanBuckets } from "../../core/economy";
import type { GameContent } from "../../data/content";
import type {
  ConfirmPlanResult,
  CreateProfileInput,
  DayState,
  GoalOption,
  JournalEntry,
  OpenDayResult,
  ProfileView,
  PurchaseResult,
  SavingsView,
  TransferResult,
  WithdrawResult,
} from "../../data/repositories/gameRepository";

export type { DayState, GoalOption, JournalEntry, ProfileView, SavingsView };

/** UI-facing slice of the game repository — the persistence seam tests fake. */
export type SessionGame = {
  createProfile(input: CreateProfileInput): string;
  getProfile(profileId: string): ProfileView;
  deleteProfile(profileId: string): void;
  openDay(profileId: string): OpenDayResult;
  savingsState(profileId: string): SavingsView;
  dayState(profileId: string): DayState;
  saveDraftPlan(profileId: string, dayId: string, buckets: PlanBuckets): void;
  confirmPlan(profileId: string, dayId: string): ConfirmPlanResult;
  purchase(profileId: string, dayId: string, item: CatalogItem): PurchaseResult;
  transferToSavings(profileId: string, dayId: string, amount: number): TransferResult;
  withdrawFromSavings(profileId: string, dayId: string, amount: number): WithdrawResult;
  setActiveGoal(profileId: string, goalKey: string): void;
  listGoals(profileId: string): GoalOption[];
  listJournal(profileId: string): JournalEntry[];
  purchasedItemIds(profileId: string, dayId: string): string[];
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
