# 03: Draft План — promise, track, yesterday

**What to build:** Draft План shows the promise copy, Копилка extra, tracks at max = today’s available, and «вчера N» from `lastClosedDay` when it exists. Confirm body is the new promise. Locked view unchanged (план · потрачено, no yesterday, no track). Extend `planFlow`.

**Blocked by:** 01, 02

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/plan-rework/spec.md` (stories 1–19, 38–40, 44; Implementation Decisions: draft copy, yesterday, track wiring)
- Map: `.scratch/plan-rework/map.md`
- Prior art: `src/ui/screens/PlanScreen.tsx`, `src/ui/__tests__/planFlow.test.tsx`, `SessionGame.lastClosedDay`

## Must

- Promise line under available. Копилка extra only under that row. Confirm body from strings.
- Wire `showTrack` and `max={day.available}` on the three draft steppers. Tour still must not persist drafts or lock confirm.
- Yesterday only on draft when `lastClosedDay` is non-null; «вчера 0» allowed; never prefill. Hidden after confirm.
- `planFlow`: assert promise copy, confirm body, ± still works, over-budget still blocks, returning child with no closed day has no «вчера», Баланс 110 after confirm.

## Done when

`npm test -- src/ui/__tests__/planFlow.test.tsx` and `npm run typecheck` pass.
