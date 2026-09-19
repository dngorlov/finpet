let sequence = 0;

/**
 * Generates collision-resistant local SQLite identifiers without relying on
 * the Web Crypto global, which is not available in every React Native runtime.
 * These identifiers are not security tokens.
 */
export function createLocalId(prefix: string): string {
  sequence = (sequence + 1) % Number.MAX_SAFE_INTEGER;
  const time = Date.now().toString(36);
  const count = sequence.toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${time}_${count}_${random}`;
}
