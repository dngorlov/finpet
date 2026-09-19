import { runMigrations, type Migration, type MigrationDriver } from "../runMigrations";
import { MIGRATIONS } from "../migrations";

class FakeSqlite implements MigrationDriver {
  constructor(initialUserVersion = 0) {
    this.userVersion = initialUserVersion;
  }

  userVersion: number;
  statements: string[] = [];

  execSync(sql: string): void {
    this.statements.push(sql);
    const match = /PRAGMA user_version = (\d+)/.exec(sql);
    if (match) this.userVersion = Number(match[1]);
  }

  getFirstSync<T>(sql: string): T | null {
    if (sql.startsWith("PRAGMA user_version")) {
      return { user_version: this.userVersion } as T;
    }
    return null;
  }

  createTableStatements(): string[] {
    return this.statements.filter((s) => s.includes("CREATE TABLE"));
  }
}

describe("runMigrations", () => {
  it("applies every pending migration in order on a fresh database", () => {
    const driver = new FakeSqlite(0);
    const list: readonly Migration[] = [
      { version: 1, up: "CREATE TABLE t1;" },
      { version: 2, up: "CREATE TABLE t2;" },
      { version: 3, up: "CREATE TABLE t3;" },
    ];

    runMigrations(driver, list);

    expect(driver.userVersion).toBe(3);
    const created = driver.createTableStatements();
    expect(created).toHaveLength(3);
    expect(created[0]).toContain("t1");
    expect(created[1]).toContain("t2");
    expect(created[2]).toContain("t3");
  });

  it("skips migrations the database already applied", () => {
    const driver = new FakeSqlite(2);
    const list: readonly Migration[] = [
      { version: 1, up: "CREATE TABLE t1;" },
      { version: 2, up: "CREATE TABLE t2;" },
      { version: 3, up: "CREATE TABLE t3;" },
    ];

    runMigrations(driver, list);

    expect(driver.userVersion).toBe(3);
    expect(driver.createTableStatements()).toHaveLength(1);
    expect(driver.createTableStatements()[0]).toContain("t3");
  });

  it("leaves a fully migrated database untouched", () => {
    const driver = new FakeSqlite(3);
    const list: readonly Migration[] = [
      { version: 1, up: "CREATE TABLE t1;" },
      { version: 2, up: "CREATE TABLE t2;" },
      { version: 3, up: "CREATE TABLE t3;" },
    ];

    runMigrations(driver, list);

    expect(driver.userVersion).toBe(3);
    expect(driver.statements).toHaveLength(0);
  });

  it("applies meta then the settled game schema and ends at version 2", () => {
    const driver = new FakeSqlite(0);

    runMigrations(driver, MIGRATIONS);

    expect(driver.userVersion).toBe(2);
    expect(driver.createTableStatements()[0]).toContain("CREATE TABLE IF NOT EXISTS meta");
    const ddl = driver.statements.join("\n");
    for (const table of [
      "profiles",
      "days",
      "plans",
      "transactions",
      "purchases",
      "savingsTransfers",
      "goals",
      "petState",
      "meterEvents",
      "dayScores",
      "taskProgress",
    ]) {
      expect(ddl).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it("real migration set is a no-op on an already migrated database", () => {
    const driver = new FakeSqlite(2);

    runMigrations(driver, MIGRATIONS);

    expect(driver.userVersion).toBe(2);
    expect(driver.statements).toHaveLength(0);
  });
});
