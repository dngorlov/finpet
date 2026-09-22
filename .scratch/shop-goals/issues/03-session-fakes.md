# 03: SessionGame and fake ports

**What to build:** The UI persistence seam grows `clearActiveGoal`, `purchaseFromSavings`, funded-without-spend deposits, owned-`once` reads, and bought-as-Цель count so screens and RNTL fakes match ticket 02.

**Blocked by:** 02

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (Testing Decisions: Fake SessionGame)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `src/ui/session/types.ts`, `src/ui/testSupport/fakePorts.ts`, `src/ui/session/childProgress.ts`, `src/ui/session/demoMode.ts`, `src/ui/screens/FirstRunScreen.tsx`

## Must

- Extend `SessionGame` with the new repository intents (names may match 1:1). Fakes implement them with enough fidelity for later savings/shop flows: pot stays on fund, no +10 mood on deposit, buy-from-Копилка, clear Цель, `once` hiding, N-stamp.
- First-run / demo / `seedReturningChild` still seed Скейтборд from catalog (`skateboard`), not `goals.json`.
- Screens may still be on old chips; typecheck must pass (stubs or keep compiling). Prefer wiring createProfile to catalog optional ids here so 04/05 do not invent a second seed path.
- Do not add a new test file. Fake behavior is proven when 06’s flows run; a thin existing sessionReads tweak is OK if a compile/seed assertion breaks.

## Done when

`npm run typecheck` passes. `seedReturningChild` still opens Main with Цель Скейтборд.

## Answer

SessionGame now has `purchaseFromSavings`, `clearActiveGoal`, and `boughtAsActiveGoalCount`. The fake funds a Цель without shrinking the pot or moving Настроение, stamps a Копилка buy as bought-as-active-Цель, and ignores those purchases in План actuals. First run, demo, and `seedReturningChild` seed catalog id `skateboard`. `engineItem` passes `once`. `tsc --noEmit` passed.
