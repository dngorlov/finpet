# 06: Flow tests and sister fixtures

**What to build:** Navigation-root coverage listed in the spec, plus sister flows/fakes that still assume three preset chips, auto-debit, +10 on reach, or BlockedSheet «Отложить» on a Желаемое.

**Blocked by:** 04, 05

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (Testing Decisions seam 2 + sister flows)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `src/ui/__tests__/savingsFlow.test.tsx`, `src/ui/__tests__/shopFlow.test.tsx`, `src/ui/__tests__/firstRunFlow.test.tsx`, `src/ui/__tests__/economyFlow.test.tsx`, `src/ui/__tests__/progressFlow.test.tsx`, `src/ui/__tests__/tasksLoopFlow.test.tsx`

## Must

- No third flow file. Extend savingsFlow + shopFlow until they cover: Celebration Купить/Позже and no «Настроение +10»; buy from pot on Копилка and on the Магазин sheet; «Сделать целью» + confirm-switch; BlockedSheet «Сделать целью» on Игрушка; one-shot labelled and gone after buy; post-buy «Выбрать новую цель» opens the picker; impulse Скейтборд does not bump N; Конфета-as-Цель buy does. «Целей: N» on Прогресс.
- Fix sister tests/queries that break. Independent literals from the spec.
- RNTL v14: async render, `screen`, `userEvent`, role/name.
- `npm test` and `npm run typecheck` green.

## Done when

`npm test` and `npm run typecheck` pass.

## Answer

Sister flows leave a short Игрушка block through «Сделать целью» and «Закрыть» without replacing Скейтборд. Прогресс «Целей: N» reads `boughtAsActiveGoalCount`. Shop flow buys a funded Скейтборд from the sheet (Настроение +12, shelf hides it, N = 1) and an impulse Скейтборд with no Цель (N = 0).
