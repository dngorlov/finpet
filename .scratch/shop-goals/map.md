# Shop-item Цели — map

## Notes

Spec: `.scratch/shop-goals/spec.md`

One PR branch: `feat/shop-goals`. Ticket branches: `feat/sg-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved in spec): repository node suite; navigation-root RNTL via `savingsFlow` + `shopFlow` and fake `SessionPorts`. No third flow file.

Do not touch uncommitted MeterBar / StatusStrip WIP.

## Decisions-so-far

- Grill locked 2026-09-20 in the spec. CONTEXT.md already has **Цель** as one Магазин Желаемое, **Копилка** leaving by withdrawal or buying that Цель, **Настроение** from Желаемые only.
- Ticket 01 resolved: 11-item catalog with `once` dreams, derived `goals` from optional rows, funded `applyGoalProgress` leaves the pot, Словарик matches CONTEXT.md. `.scratch/shop-goals/issues/01-content-core.md`
- Ticket 02: repository engine (funded deposit, buy-from-Копилка, clear Цель, actuals). `.scratch/shop-goals/issues/02-repository.md`
- Ticket 03: SessionGame + fake ports. `.scratch/shop-goals/issues/03-session-fakes.md`
- Ticket 04: Копилка UI. `.scratch/shop-goals/issues/04-savings-ui.md`
- Ticket 05: Магазин UI + shared picker. `.scratch/shop-goals/issues/05-shop-picker.md`
- Ticket 06: flow + sister tests. `.scratch/shop-goals/issues/06-flow-tests.md`
- Ticket 07: REQUIREMENTS / ROADMAP. `.scratch/shop-goals/issues/07-docs.md`

## Fog

None for this pass. Device visual of Celebration is not in the automated seam.
