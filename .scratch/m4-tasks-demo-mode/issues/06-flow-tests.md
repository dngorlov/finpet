# 06: Задания + demo navigation-root flows

**What to build:** One or two navigation-root flows prove the M4 loop a child and a juror can actually play: complete a Задание with reward, close a day with Итоги дня, freeze the normal hub, then five consecutive demo days, reset, and exit without touching the child profile.

**Blocked by:** 02, 03, 04, 05

**Status:** resolved

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (Testing Decisions, AC)
- Prior art: `src/ui/__tests__/economyFlow.test.tsx`
- RNTL v14: async `render`, `screen`, `userEvent`, role/name first

## Must

- Prefer one or two flow files at `FinPetApp` + fake ports, not per-screen suites that re-assert layout.
- Задания flow as spec Testing Decisions (unlock, retry, spawn, first +10 then replay 0, BlockedSheet → list).
- Day close + demo flow as spec Testing Decisions (Итоги дня, waiting hub, enter demo, five «Следующий день», reset, exit, child intact). Fake may pre-confirm a plan between demo days.
- Keep first-run and economy coverage green. Do not re-test M1 invariants. Do not snapshot styles.

## Done when

`npm test` covers both M4 flows at the navigation-root seam and `npm run typecheck` passes.

## Answer

Two navigation-root RNTL files at `FinPetApp` + fake ports cover the combined M4 ACs. `tasksLoopFlow.test.tsx` walks day-1 unlock, retry, first +10 then replay 0, Shop BlockedSheet → real Задания list, and backpack spawn of «Почини рюкзак». `dayCloseDemoFlow.test.tsx` confirms a plan, shows Итоги дня, waits on Main, enters Демо-режим, runs five «Следующий день» (`confirmActiveDayPlan` pre-confirms between days), resets the demo, and exits with the child's closed day, Баланс, and task progress intact. Slice tests stay. `npm test` 95 passed; `npm run typecheck` passed.
