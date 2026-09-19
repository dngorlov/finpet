# 01: Confirm a План from Main

**What to build:** A returning child can open План from Main, split today's available Монеты across Обязательные / Желаемые / Копилка with steppers, see the remainder, and confirm. After confirm the plan is locked, Main shows «План готов», and during-day План shows план / потрачено (spent still zero). Confirming does not move Монеты.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (План stories, SessionGame / `dayState`, Implementation Decisions)
- Map: `.scratch/m3-economy-loop-ui/map.md`
- Existing writes: game-repository `saveDraftPlan` / `confirmPlan`
- UI seam: `SessionGame` + `createFakePorts` / `seedReturningChild`
- Prior art: `src/ui/__tests__/firstRunFlow.test.tsx`

## Must

- Extend `SessionGame` with the full M3 read/write surface from the spec (`dayState`, plan save/confirm, purchase, savings in/out, set active Цель, `listGoals`, `listJournal`, `purchasedItemIds`) so later tickets do not fight the type. Fakes implement all of it; this ticket's screens only have to *use* plan + `dayState`.
- Add repository reads (`dayState`, `listJournal`, `listGoals`, `purchasedItemIds`) on the existing game repository. Thin node tests for the public read shape only. Do not change write math.
- Replace the План stub with a real Plan screen using kit chrome. Available header, three buckets with ± (48 dp), remainder, validation when total > available, «Подтвердить план» behind a confirmation sheet, lock after confirm, plan-vs-actual columns when confirmed.
- Main: navigate to Plan; highlighted hint until confirm, then «План готов» (icon + text, not color alone). Reload `dayState` on focus.
- «Закончить день» without a plan keeps the existing prompt; with a confirmed plan show a next-step that Итоги дня are not here yet (do not call `closeDay`).
- Register Plan on the stack. Leave Магазин / Копилка / Задания / Взрослый раздел as they are.
- Cover this slice at the navigation-root seam: returning child → План → remainder / over-budget block / confirm → lock → Main «План готов». Do not yet require the full Appendix A 7–9 flow.

## Done when

A returning child can confirm a valid План from Main, cannot edit it afterwards, and Main reflects «План готов». `npm test` and `npm run typecheck` pass.
