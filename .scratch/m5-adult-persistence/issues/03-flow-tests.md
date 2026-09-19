# 03: Adult + persistence flow tests

**What to build:** Navigation-root coverage for M5: gate already in 01; this ticket asserts Adult overview, typed reset/delete, remount persistence routing, and that demo still cannot see child destructive actions.

**Blocked by:** 01, 02

**Status:** ready-for-agent

Type: task

## Pointers

- Spec: `.scratch/m5-adult-persistence/spec.md` (Testing Decisions; stories 9–23, 27–28, 32)
- Prior art: `src/ui/__tests__/demoFlow.test.tsx`, `firstRunFlow.test.tsx` remount
- RNTL v14: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`
- Helper: `passAdultGate` from ticket 01

## Must

- One (or two sibling) navigation-root files, not a file per sheet. Seed a returning child with some purchases / task progress / savings so reset and remount have something to compare.
- Assert: Adult shows positive topic/overall copy; typed «сбросить» keeps names, lands Main at grant-level Баланс, unpaid tasks; remount after play stays Main with intact Баланс, purchases, Копилка, Цель, task progress; typed «удалить» → Первый запуск and remount stays there; while demo is on, «Сбросить прогресс» / «Удалить профиль» are absent; M4 enter/reset/exit still pass behind the gate.
- Do not re-test question bounds (ticket 01 helper test) or M1 balance invariants.
- Keep `firstRunFlow`'s __DEV__ Settings delete test; do not move production delete into Settings.

## Done when

Appendix A 11–12 are passable in the UI tests (remount stands in for kill-and-relaunch). `npm test` and `npm run typecheck` pass.
