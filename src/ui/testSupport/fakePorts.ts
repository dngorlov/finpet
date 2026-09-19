import { loadContent } from "../../data/content";
import type { CreateProfileInput, ProfileView } from "../../data/repositories/gameRepository";
import { META_KEYS } from "../session/metaKeys";
import type { SessionPorts } from "../session/types";

type StoredProfile = ProfileView & {
  dayOpen: boolean;
  goals: readonly { key: string; cost: number }[];
  activeGoalKey: string;
};

function viewOf(row: StoredProfile): ProfileView {
  const { dayOpen: _dayOpen, goals: _goals, activeGoalKey: _activeGoalKey, ...view } = row;
  return view;
}

/** In-memory game + meta adapters for jest-expo (no SQLite). */
export function createFakePorts(): SessionPorts {
  const meta = new Map<string, string>();
  const profiles = new Map<string, StoredProfile>();

  return {
    content: loadContent(),
    meta: {
      get(key) {
        return meta.get(key) ?? null;
      },
      set(key, value) {
        meta.set(key, value);
      },
    },
    game: {
      createProfile(input: CreateProfileInput) {
        const id = input.id ?? `p_${profiles.size + 1}`;
        profiles.set(id, {
          id,
          name: input.name,
          petName: input.petName,
          species: input.species,
          color: input.color,
          accessory: input.accessory,
          balance: 100,
          isDemo: Boolean(input.isDemo),
          care: 50,
          mood: 50,
          stage: "novice",
          dayOpen: false,
          goals: input.goals.map((g) => ({ key: g.key, cost: g.cost })),
          activeGoalKey: input.activeGoalKey,
        });
        return id;
      },
      getProfile(profileId) {
        const row = profiles.get(profileId);
        if (!row) throw new Error(`Профиль ${profileId} не найден`);
        return viewOf(row);
      },
      openDay(profileId) {
        const row = profiles.get(profileId);
        if (!row) throw new Error(`Профиль ${profileId} не найден`);
        const dayId = `${profileId}#1`;
        if (row.dayOpen) {
          return { status: "opened" as const, dayId, n: 1, allowanceCredited: false };
        }
        row.dayOpen = true;
        row.balance += 10;
        return { status: "opened" as const, dayId, n: 1, allowanceCredited: true };
      },
      savingsState(profileId) {
        const row = profiles.get(profileId);
        if (!row) throw new Error(`Профиль ${profileId} не найден`);
        const active = row.goals.find((g) => g.key === row.activeGoalKey);
        if (!active) {
          return { pot: 0, estimateDays: null, activeGoal: null };
        }
        return {
          pot: 0,
          estimateDays: null,
          activeGoal: {
            key: active.key,
            cost: active.cost,
            remaining: active.cost,
            achieved: false,
          },
        };
      },
    },
  };
}

export function seedReturningChild(ports: SessionPorts, input?: Partial<CreateProfileInput>): string {
  const content = ports.content;
  const firstGoal = content.goals[0];
  if (!firstGoal) throw new Error("Нет целей в контенте");
  const id = ports.game.createProfile({
    name: "Миша",
    petName: "Пух",
    species: "sp1",
    color: "c1",
    accessory: "a1",
    contentVersion: content.contentVersion,
    goals: content.goals.map((g) => ({ key: g.id, cost: g.cost })),
    activeGoalKey: firstGoal.id,
    ...input,
  });
  ports.game.openDay(id);
  ports.meta.set(META_KEYS.activeProfileId, id);
  ports.meta.set(META_KEYS.onboardingDone, "1");
  return id;
}
