# Plan rework — map

## Notes

Spec: `.scratch/plan-rework/spec.md`

One PR branch: `feat/plan-rework`. Ticket branches: `feat/plan-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved): navigation-root RNTL via fake `SessionPorts`; content loader node test for 11 terms + `plan-buckets` body. Do not add a new plan-rework test file.

Do not touch uncommitted MeterBar / StatusStrip WIP on other worktrees.

## Decisions-so-far

- Grill locked in the spec Further Notes. CONTEXT.md already has **План** as a promise.
- Ticket 01: promise/leftover strings, Словарик **План** after Пособие (11 terms), `plan-buckets` tooltip body. `.scratch/plan-rework/issues/01-copy-content.md`
- Ticket 02: AmountStepper optional `showTrack` + hold-repeat ±1; Копилка callers stay tap-only until PlanScreen is wired. `.scratch/plan-rework/issues/02-amount-track.md`
- Ticket 03: draft План promise line + Копилка extra, tracks at max = today’s available, yesterday from `lastClosedDay` (not prefilled; hidden after confirm). `.scratch/plan-rework/issues/03-plan-draft.md`

## Fog

None for this pass. Device visual of the track is not in the automated seam.
