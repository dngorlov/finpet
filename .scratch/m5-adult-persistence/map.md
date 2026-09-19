# M5 Взрослый раздел + persistence — map

## Notes

Spec: `.scratch/m5-adult-persistence/spec.md`

One PR branch: `feat/m5-adult-persistence`. Ticket branches: `feat/m5-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved): navigation-root RNTL via fake `SessionPorts` + `passAdultGate`; device AC for Appendix A 11–12 and full 1–12 twice. No new persistence port. Live app keeps SystemClock.

## Decisions-so-far

- Gate on every Main → Adult entry; correct answer is not stored.
- After the gate, `replace` into the existing Demo panel (M4 file). Main tile goes to `AdultGate`.
- Reset/delete compose `createProfile` / `deleteProfile`; hide child destructive actions while `isDemo`.
- AdultGate is in front of the Demo panel; `passAdultGate` is the shared test helper ([01-adult-gate.md](issues/01-adult-gate.md)).
- Adult overview + typed child reset/delete live on the Demo panel; hidden while `isDemo` ([02-adult-contents.md](issues/02-adult-contents.md)).
- Navigation-root ACs for overview, reset/delete, remount, and demo-hidden destructives ([03-flow-tests.md](issues/03-flow-tests.md)).

## Fog

Device Appendix A 1–12 twice still needs a machine with Android SDK (same gap as M0–M4).
