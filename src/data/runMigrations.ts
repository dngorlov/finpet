/**
 * Migration runner over a minimal sqlite driver port.
 *
 * Keeping this file free of expo/react imports is what makes the migration
 * seam testable in plain jest (ROADMAP §3); `db.ts` adapts the real
 * expo-sqlite handle to `MigrationDriver`.
 */

export interface MigrationDriver {
  execSync(sql: string): void;
  getFirstSync<T>(sql: string): T | null;
}

export interface Migration {
  version: number;
  up: string;
}

export function runMigrations(
  driver: MigrationDriver,
  migrations: readonly Migration[],
): void {
  const row = driver.getFirstSync<{ user_version: number }>("PRAGMA user_version");
  const current = row?.user_version ?? 0;

  for (const migration of migrations) {
    if (migration.version <= current) {
      continue;
    }
    driver.execSync(
      [
        "BEGIN TRANSACTION;",
        migration.up,
        `PRAGMA user_version = ${migration.version};`,
        "COMMIT;",
      ].join("\n"),
    );
  }
}
