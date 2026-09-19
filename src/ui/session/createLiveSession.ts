import { SystemClock } from "../../core/clock";
import { loadContent } from "../../data/content";
import { bootDatabase } from "../../data/db";
import { createGameRepository } from "../../data/repositories/gameRepository";
import { createMetaRepository } from "../../data/repositories/metaRepository";
import type { SessionPorts } from "./types";

/** Live adapter: expo-sqlite repositories + content. Tests inject fakes instead. */
export function createLiveSession(): SessionPorts {
  const db = bootDatabase();
  const clock = new SystemClock();
  const game = createGameRepository(db.drizzle, clock);
  return {
    firstRun: {
      complete: game.completeFirstRun,
    },
    game,
    meta: createMetaRepository(db.drizzle),
    content: loadContent(),
  };
}
