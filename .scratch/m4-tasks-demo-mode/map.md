# M4 Задания + Демо-режим — map

## Notes

Spec: `.scratch/m4-tasks-demo-mode/spec.md`

One PR branch: `feat/m4-tasks-demo-mode`. Ticket branches: `feat/m4-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/` when run in parallel.

Seams (approved): navigation-root RNTL via fake `SessionPorts`; device AC for Appendix A 6, 10 and five demo days. Repository read-model tests stay on the existing M1 node suite. Live app keeps SystemClock; demo cadence is the existing `isDemo` unlock branch.

## Decisions-so-far

- Reuse M1 `applyTaskStep` / `claimTaskReward` / `closeDay` / `createProfile({ isDemo })`. No second engine.
- Reward: `good` or `warn` exit is correct; `bad` exit completes without pay and leaves `rewardPaid` false.
- No schema shape change: `lastClosedDay` reconstructs from existing `dayScores` / plans / purchases / meterEvents.
- SessionGame M4 reads are live: expanded `closeDay`, `lastClosedDay`, `listTaskProgress`, `dayState.open`; fake `openDay` blocks non-demo after close ([01-session-reads.md](issues/01-session-reads.md)).
- Progress Итоги fills from `lastClosedDay` (no UI stage recompute); Журнал labels `task_reward:*` / `task_scene` ([05-progress-itogi.md](issues/05-progress-itogi.md)).
- AdultGate stays M5; this milestone ships a thin demo panel.
- DaySummary + waiting hub: confirmed «Закончить день» calls `closeDay` / `lastClosedDay`; normal Main freezes План/Магазин/Копилка until tomorrow ([03-day-close.md](issues/03-day-close.md)).
- Demo panel replaces the Adult stub: confirm/reset/exit compose `createProfile({ isDemo })` / `deleteProfile` with meta `childProfileId`; Demo Main banner + `unlockedTasks(..., profile.isDemo)` ([04-demo-panel.md](issues/04-demo-panel.md)).
- TaskList / TaskRun / TaskResult replace the Задания stub; hub «Играть» jumps to the preferred task ([02-task-runner.md](issues/02-task-runner.md)).
- Combined navigation-root ACs: Задания loop (unlock, retry, +10/replay, spawn, BlockedSheet) and five demo days + reset + exit leaving the child intact ([06-flow-tests.md](issues/06-flow-tests.md)).

## Fog

Device Appendix A 6, 10 and five demo days still need a machine with Android SDK (same gap as M0–M3).
