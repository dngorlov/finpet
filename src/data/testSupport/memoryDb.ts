import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { ManualClock, type Clock } from "../../core/clock";
import { MIGRATIONS } from "../migrations";
import { runMigrations } from "../runMigrations";
import * as schema from "../schema";
import { createGameRepository } from "../repositories/gameRepository";
import { createMetaRepository } from "../repositories/metaRepository";

export function openMemoryGame(clock: Clock = new ManualClock(new Date(2026, 8, 19, 12, 0, 0))) {
  const sqlite = new Database(":memory:");
  sqlite.pragma("foreign_keys = ON");
  runMigrations(
    {
      execSync: (sql) => {
        sqlite.exec(sql);
      },
      getFirstSync: <T>(sql: string) => (sqlite.prepare(sql).get() as T | undefined) ?? null,
    },
    MIGRATIONS,
  );
  const db = drizzle(sqlite, { schema });
  return {
    sqlite,
    db,
    clock,
    game: createGameRepository(db, clock),
    meta: createMetaRepository(db),
  };
}
