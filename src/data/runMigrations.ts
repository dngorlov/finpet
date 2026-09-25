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
    applyOne(driver, migration);
  }
}

const OPEN_TRANSACTION = /within a transaction/i;

function script(migration: Migration): string {
  return [
    "BEGIN TRANSACTION;",
    migration.up,
    `PRAGMA user_version = ${migration.version};`,
    "COMMIT;",
  ].join("\n");
}

/** Best effort: there may be no transaction to roll back. */
function rollback(driver: MigrationDriver): void {
  try {
    driver.execSync("ROLLBACK;");
  } catch {
    // nothing was open
  }
}

/**
 * Runs one migration atomically. A statement that fails half-way would leave
 * BEGIN open on the (cached) native connection, and every later boot then dies
 * with «cannot start a transaction within a transaction» instead of the real
 * error — so roll back on failure, recover once from a transaction left open by
 * an earlier crash, and rethrow the real cause with the version number.
 */
function applyOne(driver: MigrationDriver, migration: Migration, retried = false): void {
  try {
    driver.execSync(script(migration));
  } catch (error) {
    rollback(driver);
    const message = error instanceof Error ? error.message : String(error);
    if (!retried && OPEN_TRANSACTION.test(message)) {
      applyOne(driver, migration, true);
      return;
    }
    throw new Error(`Миграция ${migration.version} не применилась: ${message}`);
  }
}
