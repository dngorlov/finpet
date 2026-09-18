import type { Migration } from "./runMigrations";

/**
 * The settled schema lives in ROADMAP §3.2. Migrations land here one at a
 * time as milestones need them; M0 ships only the `meta` table so the
 * migration path itself is proven.
 */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    up: `CREATE TABLE IF NOT EXISTS meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);`,
  },
];
