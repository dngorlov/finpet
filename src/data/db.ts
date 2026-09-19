import { openDatabaseSync, type SQLiteDatabase } from "expo-sqlite";
import { drizzle, type ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { MIGRATIONS } from "./migrations";
import { runMigrations, type MigrationDriver } from "./runMigrations";
import * as schema from "./schema";

export type FinPetDb = ExpoSQLiteDatabase<typeof schema>;

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
    sqlite.execSync("PRAGMA foreign_keys = ON;");
    instance = { sqlite, drizzle: drizzle(sqlite, { schema }) };
  }
  return instance;
}
