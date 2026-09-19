import { META_KEYS } from "../../data/metaKeys";
import type { GameContent } from "../../data/content";
import type { CreateProfileInput } from "../../data/repositories/gameRepository";
import { strings } from "../strings";
import type { SessionGame, SessionMeta } from "./types";

function demoInput(content: GameContent): CreateProfileInput {
  const firstGoal = content.goals[0];
  if (!firstGoal) throw new Error("Нет целей в контенте");
  return {
    name: strings.demoName,
    petName: strings.demoName,
    species: "sp1",
    color: "c1",
    accessory: "a1",
    isDemo: true,
    contentVersion: content.contentVersion,
    goals: content.goals.map((goal) => ({ key: goal.id, cost: goal.cost })),
    activeGoalKey: firstGoal.id,
  };
}

function profileExists(game: SessionGame, profileId: string): boolean {
  try {
    game.getProfile(profileId);
    return true;
  } catch {
    return false;
  }
}

function rememberChild(game: SessionGame, meta: SessionMeta): void {
  if (meta.get(META_KEYS.childProfileId)) return;
  const activeId = meta.get(META_KEYS.activeProfileId);
  if (!activeId) return;
  const current = game.getProfile(activeId);
  if (!current.isDemo) meta.set(META_KEYS.childProfileId, activeId);
}

/** Enter Демо-режим: remember the child, create the demo profile once, switch active. */
export function enterDemo(game: SessionGame, meta: SessionMeta, content: GameContent): void {
  rememberChild(game, meta);
  let demoId = meta.get(META_KEYS.demoProfileId);
  if (!demoId || !profileExists(game, demoId)) {
    demoId = game.createProfile(demoInput(content));
    meta.set(META_KEYS.demoProfileId, demoId);
  }
  meta.set(META_KEYS.activeProfileId, demoId);
}

/** Exit Демо-режим: restore the child; leave the demo row in place. */
export function exitDemo(meta: SessionMeta): void {
  const childId = meta.get(META_KEYS.childProfileId);
  if (!childId) return;
  meta.set(META_KEYS.activeProfileId, childId);
}

/** «Сбросить демо»: delete and recreate at initial state; stay on the new demo id. */
export function resetDemo(game: SessionGame, meta: SessionMeta, content: GameContent): void {
  rememberChild(game, meta);
  const demoId = meta.get(META_KEYS.demoProfileId);
  if (demoId && profileExists(game, demoId)) {
    game.deleteProfile(demoId);
  }
  const id = game.createProfile(demoInput(content));
  meta.set(META_KEYS.demoProfileId, id);
  meta.set(META_KEYS.activeProfileId, id);
}

export function demoExists(game: SessionGame, meta: SessionMeta): boolean {
  const demoId = meta.get(META_KEYS.demoProfileId);
  return Boolean(demoId && profileExists(game, demoId));
}
