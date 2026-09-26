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

  it("applies meta then the settled game schema and ends at version 9", () => {
    const driver = new FakeSqlite(0);

    runMigrations(driver, MIGRATIONS);

    expect(driver.userVersion).toBe(9);
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
      "deposits",
      "achievements",
    ]) {
      expect(ddl).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
    expect(ddl).toContain("ALTER TABLE purchases ADD COLUMN paidFrom");
    expect(ddl).toContain("ALTER TABLE goals ADD COLUMN fundedCelebrated");
    expect(ddl).toContain("ALTER TABLE taskProgress ADD COLUMN bestReward");
    expect(ddl).toContain("ALTER TABLE taskProgress ADD COLUMN correctAnswers");
    expect(ddl).toContain("ALTER TABLE taskProgress ADD COLUMN firstCompletedAt");
    expect(ddl).toContain("ALTER TABLE goals ADD COLUMN custom");
    expect(ddl).toContain("ALTER TABLE petState ADD COLUMN stageCredit");
    expect(ddl).toContain("ALTER TABLE profiles ADD COLUMN dailyRewardClaimed");
  });

  it("real migration set is a no-op on an already migrated database", () => {
    const driver = new FakeSqlite(9);

    runMigrations(driver, MIGRATIONS);

    expect(driver.userVersion).toBe(9);
    expect(driver.statements).toHaveLength(0);
  });

  it("rolls back a failing migration and reports its real error with the version", () => {
    const driver = new FakeSqlite(0);
    const exec = driver.execSync.bind(driver);
    driver.execSync = (sql: string) => {
      exec(sql);
      if (sql.includes("BROKEN")) throw new Error("near BROKEN: syntax error");
    };

    expect(() =>
      runMigrations(driver, [
        { version: 1, up: "CREATE TABLE t1;" },
        { version: 2, up: "BROKEN;" },
      ]),
    ).toThrow("Миграция 2 не применилась: near BROKEN: syntax error");
    expect(driver.statements.at(-1)).toBe("ROLLBACK;");
  });

  it("recovers once from a transaction an earlier crash left open", () => {
    const driver = new FakeSqlite(0);
    const exec = driver.execSync.bind(driver);
    let open = true;
    driver.execSync = (sql: string) => {
      if (sql === "ROLLBACK;") {
        open = false;
      } else if (open && sql.startsWith("BEGIN")) {
        throw new Error("cannot start a transaction within a transaction");
      }
      exec(sql);
    };

    runMigrations(driver, [{ version: 1, up: "CREATE TABLE t1;" }]);

    expect(driver.userVersion).toBe(1);
    expect(driver.createTableStatements()).toHaveLength(1);
  });
});
