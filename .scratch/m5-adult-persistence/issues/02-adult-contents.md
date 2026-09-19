# 02: Adult progress, reset, and Удалить профиль

**What to build:** The Demo panel becomes the Adult surface: positive-wording topic/overall progress, existing demo controls, typed «Сбросить прогресс» and «Удалить профиль» on the child profile. Hide those two actions while `isDemo`.

**Blocked by:** 01

**Status:** ready-for-agent

Type: task

## Pointers

- Spec: `.scratch/m5-adult-persistence/spec.md` (stories 9–26, 35; Implementation Decisions: overview, destructive writes, typed confirm)
- Writes: existing `createProfile` / `deleteProfile`; meta keys in `src/data/metaKeys.ts`
- Demo ops stay in `src/ui/session/demoMode.ts`; put child reset/delete beside it
- Prior art: `src/ui/screens/DemoScreen.tsx` confirm sheets; `src/ui/screens/ProgressScreen.tsx` task/topic counts

## Must

- Overview from `listTaskProgress` + `lastClosedDay` + content topics only. Topics Бюджет / Копилки / Платежи: complete when both non-correction tasks are completed. Positive copy only (оба сделаны / одно сделано / ещё впереди). Days played or the empty «Игровых дней пока нет — это нормально.»; Задания done/6. No day score, no skipped-mandatory reasons.
- «Сбросить прогресс» (child active only): sheet, then type exactly `сбросить`; recreate with same names/appearance; keep `onboardingDone`; `reset` to Main. Economy matches a fresh profile (grant + Пособие on open).
- «Удалить профиль» (child active only): sheet, then type exactly `удалить`; delete child and demo if present; clear profile meta; `reset` to FirstRun.
- While demo is active, those two actions are absent; M4 demo toggle / «Сбросить демо» remain.
- Settings `__DEV__` DevSettings stays. Production delete is Adult-only.
- New copy only in the strings module. Do not add the full adultFlow file yet (ticket 03) unless a smoke assertion is needed to keep the panel from shipping dark.

## Done when

Adult behind the gate shows progress and can reset or delete the child with typed confirm. `npm test` and `npm run typecheck` pass.
