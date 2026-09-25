import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

/** Drizzle mirror of ROADMAP §3.2. SQL DDL lives in `migrations.ts` and is the applied source. */
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  species: text("species").notNull(),
  color: text("color").notNull(),
  accessory: text("accessory").notNull(),
  petName: text("petName").notNull(),
  balance: integer("balance").notNull(),
  isDemo: integer("isDemo").notNull(),
  contentVersion: integer("contentVersion").notNull(),
  createdAt: integer("createdAt").notNull(),
});

export const days = sqliteTable("days", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  n: integer("n").notNull(),
  openedAt: integer("openedAt").notNull(),
  closedAt: integer("closedAt"),
});

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId")
    .notNull()
    .references(() => days.id),
  mandatory: integer("mandatory").notNull(),
  optional: integer("optional").notNull(),
  savings: integer("savings").notNull(),
  status: text("status", { enum: ["draft", "confirmed"] }).notNull(),
  confirmedAt: integer("confirmedAt"),
});

export const transactions = sqliteTable("transactions", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId").references(() => days.id),
  kind: text("kind").notNull(),
  amount: integer("amount").notNull(),
  itemId: text("itemId"),
  goalId: text("goalId"),
  labelKey: text("labelKey").notNull(),
  createdAt: integer("createdAt").notNull(),
});

export const purchases = sqliteTable("purchases", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId")
    .notNull()
    .references(() => days.id),
  itemId: text("itemId").notNull(),
  price: integer("price").notNull(),
  kind: text("kind", { enum: ["mandatory", "optional"] }).notNull(),
  paidFrom: text("paidFrom", { enum: ["balance", "savings"] }).notNull(),
  boughtAsActiveGoal: integer("boughtAsActiveGoal").notNull(),
  createdAt: integer("createdAt").notNull(),
});

export const savingsTransfers = sqliteTable("savingsTransfers", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId")
    .notNull()
    .references(() => days.id),
  amount: integer("amount").notNull(),
  kind: text("kind", { enum: ["in", "out"] }).notNull(),
  createdAt: integer("createdAt").notNull(),
});

export const goals = sqliteTable("goals", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  key: text("key").notNull(),
  cost: integer("cost").notNull(),
  status: text("status", { enum: ["active", "achieved"] }).notNull(),
  isActive: integer("isActive").notNull(),
  achievedAt: integer("achievedAt"),
  fundedCelebrated: integer("fundedCelebrated").notNull(),
});

export const petState = sqliteTable("petState", {
  profileId: text("profileId")
    .primaryKey()
    .references(() => profiles.id),
  care: integer("care").notNull(),
  mood: integer("mood").notNull(),
  stage: integer("stage").notNull(),
});

export const meterEvents = sqliteTable("meterEvents", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId").references(() => days.id),
  meter: text("meter", { enum: ["care", "mood"] }).notNull(),
  delta: integer("delta").notNull(),
  source: text("source").notNull(),
  createdAt: integer("createdAt").notNull(),
});

export const dayScores = sqliteTable("dayScores", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  dayId: text("dayId")
    .notNull()
    .references(() => days.id),
  mandatoryCovered: integer("mandatoryCovered").notNull(),
  withinPlan: integer("withinPlan").notNull(),
  deposited: integer("deposited").notNull(),
  score: integer("score").notNull(),
});

export const taskProgress = sqliteTable("taskProgress", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  taskKey: text("taskKey").notNull(),
  status: text("status").notNull(),
  rewardPaid: integer("rewardPaid").notNull(),
  /** Best coins earned on this Задание so far; replays only pay above it. */
  bestReward: integer("bestReward").notNull().default(0),
  completedAt: integer("completedAt"),
});

export const meta = sqliteTable("meta", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/** Банк: a вклад locked until `maturesDayN`, then paid back with interest once. */
export const deposits = sqliteTable("deposits", {
  id: text("id").primaryKey(),
  profileId: text("profileId")
    .notNull()
    .references(() => profiles.id),
  amount: integer("amount").notNull(),
  ratePercent: integer("ratePercent").notNull(),
  days: integer("days").notNull(),
  openedDayN: integer("openedDayN").notNull(),
  maturesDayN: integer("maturesDayN").notNull(),
  status: text("status", { enum: ["open", "paid"] }).notNull(),
  openedAt: integer("openedAt").notNull(),
  paidAt: integer("paidAt"),
});
