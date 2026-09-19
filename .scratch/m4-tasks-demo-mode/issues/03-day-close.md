# 03: Close the Игровой день and show Итоги дня

**What to build:** «Закончить день» on a confirmed План calls `closeDay` and opens Итоги дня. After a normal close, Main waits until tomorrow: economy tiles disabled, Задания and Словарик still open. Demo profiles use «Следующий день» so the next day can open immediately (panel itself is ticket 04).

**Blocked by:** 01

**Status:** ready

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (stories 25–36, 38; DaySummaryView; blocked next day)
- Writes: existing `closeDay` (expanded return from 01)
- Reads: `dayState.open`, `lastClosedDay`, `getProfile.isDemo`
- Prior art: Main «Закончить день» placeholder in `MainScreen`

## Must

- Replace M3 placeholder copy. Still prompt to compose a План when unconfirmed. Confirmed → `closeDay(profileId, catalog)` → DaySummary with plan-vs-actual, +2/+1/+1 icons+words, meter deltas with reasons, Этап banner only when `stageExplanation` is set, next-day hint when mandatory was skipped.
- Primary: «Ждём завтра!» when not demo; «Следующий день» when `isDemo`. Both pop to Main so the next `openDay` can run (blocked vs allowance).
- Main when `openDay` is blocked / `dayState.open === false`: banner «Новый день откроется завтра»; disable План / Магазин / Копилка with explanation (icon+text, not color alone); keep Задания and Прогресс; hide or disable «Закончить день».
- Demo Main banner is ticket 04; this ticket only needs the DaySummary demo button to work if the active profile already `isDemo`.
- Cover at the navigation-root seam: confirm plan → finish day → Итоги дня → Main waiting banner and disabled economy tiles; Задания still opens. A skipped-mandatory close shows Забота drop copy. Do not yet require five demo days.

## Done when

Appendix A step 10 is playable in the UI test for a normal profile. `npm test` and `npm run typecheck` pass.
