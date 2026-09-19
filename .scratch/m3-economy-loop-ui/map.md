# M3 economy loop — map

## Notes

Spec: `.scratch/m3-economy-loop-ui/spec.md`

One PR branch: `feat/m3-economy-loop-ui`. Ticket branches: `feat/m3-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved): navigation-root RNTL via fake `SessionPorts`; device AC for Appendix A 5, 7–9. Repository read-model tests stay on the existing M1 node suite.

## Decisions-so-far

- Confirming a План never moves Монеты.
- Магазин / Копилка are not gated on a confirmed План.
- `closeDay` is not called. «Закончить день» after confirm explains that Итоги дня come in M4.
- FeedbackCard copy lives in `strings`, not a new content file.
- Пособие sheets when credited; Стартовый бюджет does not get a second sheet.
- 01 Plan from Main: SessionGame + `dayState`/`listJournal`/`listGoals`/`purchasedItemIds`; Plan screen; Main «План готов». See `.scratch/m3-economy-loop-ui/issues/01-plan-from-main.md`.

## Fog

Device Appendix A 5, 7–9 still needs a machine with Android SDK (same gap as M0/M2).
