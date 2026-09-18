import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { MIGRATIONS } from "./migrations";
import { runMigrations, type MigrationDriver } from "./runMigrations";

/**
 * M0: schema is only the `meta` table, so drizzle carries an empty schema
 * type; M1 widens it with the settled tables (ROADMAP §3.2).
 */
export type FinPetDb = ExpoSQLiteDatabase<Record<string, never>>;

export interface Database {
  sqlite: SQLiteDatabase;
  drizzle: FinPetDb;
}

function asMigrationDriver(sqlite: SQLiteDatabase): MigrationDriver {
  return {
    execSync: (sql) => {
      sqlite.execSync(sql);
    },
    getFirstSync: <T>(sql: string) => sqlite.getFirstSync<T>(sql),
  };
}

let instance: Database | null = null;

/** Opens (once) and migrates the local database. No network, no files beyond SQLite. */
export function bootDatabase(): Database {
  if (instance === null) {
    const sqlite = openDatabaseSync("finpet.db");
    runMigrations(asMigrationDriver(sqlite), MIGRATIONS);
    instance = { sqlite, drizzle: drizzle(sqlite) };
  }
  return instance;
}
