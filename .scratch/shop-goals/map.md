# Shop-item Цели — map

## Notes

Spec: `.scratch/shop-goals/spec.md`

One PR branch: `feat/shop-goals`. Ticket branches: `feat/sg-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved in spec): repository node suite; navigation-root RNTL via `savingsFlow` + `shopFlow` and fake `SessionPorts`. No third flow file.

Do not touch uncommitted MeterBar / StatusStrip WIP.

## Decisions-so-far

- Grill locked 2026-09-20 in the spec. CONTEXT.md already has **Цель** as one Магазин Желаемое, **Копилка** leaving by withdrawal or buying that Цель, **Настроение** from Желаемые only.
- Ticket 01 resolved: 11-item catalog with `once` dreams, derived `goals` from optional rows, funded `applyGoalProgress` leaves the pot, Словарик matches CONTEXT.md. `.scratch/shop-goals/issues/01-content-core.md`
- Ticket 02 resolved: deposit funds without spending the pot or mood; `purchaseFromSavings` / `clearActiveGoal` / `boughtAsActiveGoalCount`; `once` ownership is a purchase; Копилка-paid optionals ignored in План actuals. `.scratch/shop-goals/issues/02-repository.md`
- Ticket 03 resolved: SessionGame and fakes fund without spending or +10; `purchaseFromSavings` / `clearActiveGoal` / `boughtAsActiveGoalCount`; seeds use catalog id `skateboard`. `.scratch/shop-goals/issues/03-session-fakes.md`
- Ticket 04: Копилка UI. `.scratch/shop-goals/issues/04-savings-ui.md`
- Ticket 05 resolved: shared `GoalPicker`; Магазин sheet «Сделать целью» / «Купить из копилки» / Баланс warn; BlockedSheet optional «Сделать целью»; once labelled and omitted when owned; Main Цель from catalog. `.scratch/shop-goals/issues/05-shop-picker.md`
- Ticket 06: flow + sister tests. `.scratch/shop-goals/issues/06-flow-tests.md`
- Ticket 07 resolved: REQUIREMENTS / ROADMAP catalog 11 with `once` dreams; Копилка funds without spending and buys the Цель from the pot; no reach mood; `goals.json` deleted. `.scratch/shop-goals/issues/07-docs.md`

## Fog

None for this pass. Device visual of Celebration is not in the automated seam.
