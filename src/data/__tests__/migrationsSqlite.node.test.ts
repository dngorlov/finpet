import Database from "better-sqlite3";
import { MIGRATIONS } from "../migrations";
import { runMigrations } from "../runMigrations";
test("real SQLite: v3 db upgrades to v4, and an open txn is recovered", () => {
  const db = new Database(":memory:");
  const driver = { execSync: (s: string) => { db.exec(s); }, getFirstSync: <T,>(s: string) => (db.prepare(s).get() as T) ?? null };
  runMigrations(driver, MIGRATIONS.filter((m) => m.version <= 3));
  db.exec("BEGIN; CREATE TABLE junk(x);"); // leftover open transaction
  runMigrations(driver, MIGRATIONS);
  expect((db.prepare("PRAGMA user_version").get() as { user_version: number }).user_version).toBe(5);
  expect(db.prepare("SELECT bestReward FROM taskProgress").all()).toEqual([]);
});
