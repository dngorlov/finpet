import { eq } from "drizzle-orm";
import type { BaseSQLiteDatabase } from "drizzle-orm/sqlite-core";
import { meta } from "../schema";
import type * as schema from "../schema";

type Db = BaseSQLiteDatabase<"sync", unknown, typeof schema>;

/** Key-value store for activeProfileId, onboardingDone, animationsOn, … */
export function createMetaRepository(db: Db) {
  return {
    get(key: string): string | null {
      const row = db.select().from(meta).where(eq(meta.key, key)).get();
      return row?.value ?? null;
    },
    set(key: string, value: string): void {
      const existing = db.select().from(meta).where(eq(meta.key, key)).get();
      if (existing) {
        db.update(meta).set({ value }).where(eq(meta.key, key)).run();
      } else {
        db.insert(meta).values({ key, value }).run();
      }
    },
    remove(key: string): void {
      db.delete(meta).where(eq(meta.key, key)).run();
    },
  };
}
