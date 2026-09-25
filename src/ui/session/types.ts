import type { CatalogItem, DayBills, PlanBuckets } from "../../core/economy";
import type { TaskStepResult } from "../../core/tasks";
import type { GameContent } from "../../data/content";
import type {
  CollectDepositsResult,
  ConfirmPlanResult,
  DepositView,
  OpenDepositResult,
  CreateProfileInput,
  DayState,
  DaySummaryView,
  PinnedLessonClaim,
  GoalOption,
  JournalEntry,
  OpenDayResult,
  ProfileView,
  PurchaseResult,
  SavingsView,
  TaskProgressView,
  TransferResult,
  WithdrawResult,
} from "../../data/repositories/gameRepository";

export type { CollectDepositsResult, DepositView, OpenDepositResult };
export type { DayState, DaySummaryView, GoalOption, JournalEntry, ProfileView, SavingsView, TaskProgressView };

/** UI-facing slice of the game repository — the persistence seam tests fake. */
export type SessionGame = {
  createProfile(input: CreateProfileInput): string;
  getProfile(profileId: string): ProfileView;
  deleteProfile(profileId: string): void;
  openDay(profileId: string): OpenDayResult;
  savingsState(profileId: string): SavingsView;
  dayState(profileId: string): DayState;
  lastClosedDay(profileId: string): DaySummaryView | null;
  listTaskProgress(profileId: string): TaskProgressView[];
  listDeposits(profileId: string): DepositView[];
  openDeposit(profileId: string, dayId: string, offerId: string, amount: number): OpenDepositResult;
  collectDeposits(profileId: string, dayId: string): CollectDepositsResult;
  saveDraftPlan(profileId: string, dayId: string, buckets: PlanBuckets): void;
  confirmPlan(profileId: string, dayId: string, minMandatory?: number): ConfirmPlanResult;
  purchase(profileId: string, dayId: string, item: CatalogItem): PurchaseResult;
  purchaseFromSavings(profileId: string, dayId: string, item: CatalogItem): PurchaseResult;
  transferToSavings(profileId: string, dayId: string, amount: number): TransferResult;
  withdrawFromSavings(profileId: string, dayId: string, amount: number): WithdrawResult;
  setActiveGoal(profileId: string, item: CatalogItem | string): void;
  clearActiveGoal(profileId: string): void;
  listGoals(profileId: string): GoalOption[];
  listJournal(profileId: string): JournalEntry[];
  purchasedItemIds(profileId: string, dayId: string): string[];
  boughtAsActiveGoalCount(profileId: string): number;
  applyTaskStep(profileId: string, dayId: string, result: TaskStepResult): void;
  claimTaskReward(
    profileId: string,
    dayId: string,
    taskId: string,
    earned: number,
    lesson?: PinnedLessonClaim,
  ): number;
  closeDay(profileId: string, catalog: readonly CatalogItem[], bills?: readonly DayBills[]): DaySummaryView;
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
