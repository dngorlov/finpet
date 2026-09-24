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
  {
    version: 2,
    up: `
CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  color TEXT NOT NULL,
  accessory TEXT NOT NULL,
  petName TEXT NOT NULL,
  balance INTEGER NOT NULL,
  isDemo INTEGER NOT NULL,
  contentVersion INTEGER NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS days (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  n INTEGER NOT NULL,
  openedAt INTEGER NOT NULL,
  closedAt INTEGER
);
CREATE TABLE IF NOT EXISTS plans (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT NOT NULL REFERENCES days(id),
  mandatory INTEGER NOT NULL,
  optional INTEGER NOT NULL,
  savings INTEGER NOT NULL,
  status TEXT NOT NULL,
  confirmedAt INTEGER
);
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT REFERENCES days(id),
  kind TEXT NOT NULL,
  amount INTEGER NOT NULL,
  itemId TEXT,
  goalId TEXT,
  labelKey TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT NOT NULL REFERENCES days(id),
  itemId TEXT NOT NULL,
  price INTEGER NOT NULL,
  kind TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS savingsTransfers (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT NOT NULL REFERENCES days(id),
  amount INTEGER NOT NULL,
  kind TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS goals (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  key TEXT NOT NULL,
  cost INTEGER NOT NULL,
  status TEXT NOT NULL,
  isActive INTEGER NOT NULL,
  achievedAt INTEGER
);
CREATE TABLE IF NOT EXISTS petState (
  profileId TEXT PRIMARY KEY NOT NULL REFERENCES profiles(id),
  care INTEGER NOT NULL,
  mood INTEGER NOT NULL,
  stage INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS meterEvents (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT REFERENCES days(id),
  meter TEXT NOT NULL,
  delta INTEGER NOT NULL,
  source TEXT NOT NULL,
  createdAt INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS dayScores (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  dayId TEXT NOT NULL REFERENCES days(id),
  mandatoryCovered INTEGER NOT NULL,
  withinPlan INTEGER NOT NULL,
  deposited INTEGER NOT NULL,
  score INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS taskProgress (
  id TEXT PRIMARY KEY NOT NULL,
  profileId TEXT NOT NULL REFERENCES profiles(id),
  taskKey TEXT NOT NULL,
  status TEXT NOT NULL,
  rewardPaid INTEGER NOT NULL,
  completedAt INTEGER
);
`,
  },
  {
    version: 3,
    up: `
ALTER TABLE purchases ADD COLUMN paidFrom TEXT NOT NULL DEFAULT 'balance';
ALTER TABLE purchases ADD COLUMN boughtAsActiveGoal INTEGER NOT NULL DEFAULT 0;
ALTER TABLE goals ADD COLUMN fundedCelebrated INTEGER NOT NULL DEFAULT 0;
DELETE FROM goals WHERE isActive = 0;
UPDATE goals SET status = 'active', achievedAt = NULL;
`,
  },
  {
    version: 4,
    up: `
ALTER TABLE taskProgress ADD COLUMN bestReward INTEGER NOT NULL DEFAULT 0;
UPDATE taskProgress SET bestReward = 10 WHERE rewardPaid = 1;
`,
  },
];
