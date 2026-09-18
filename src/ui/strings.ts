/**
 * Single home for RU user-facing strings (ROADMAP §3). Vocabulary must match
 * CONTEXT.md; body text stays ≥16 sp per the UX constraints.
 */
export const strings = {
  appName: "ФинПет",
  mainGreeting: "Скоро здесь появится игра",
  versionLine: (version: string, build: number) => `версия ${version} (${build})`,
} as const;
