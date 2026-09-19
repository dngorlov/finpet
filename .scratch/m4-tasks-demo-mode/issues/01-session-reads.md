# 01: SessionGame reads and fake fidelity for M4

**What to build:** Extend the existing game-repository / `SessionGame` surface so later tickets can drive Задания, day close, and Демо-режим without fighting the type. No new screens.

**Blocked by:** None (can start immediately)

**Status:** resolved

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (Implementation Decisions: SessionGame, DaySummaryView, dayState.open, Testing Decisions)
- Map: `.scratch/m4-tasks-demo-mode/map.md`
- Existing writes: game-repository `applyTaskStep`, `claimTaskReward`, `closeDay`, `createProfile({ isDemo })`
- UI seam: `SessionGame` + `createFakePorts` / `seedReturningChild`
- Prior art: M3 ticket 01 (`dayState` / journal / goals reads)

## Must

- Extend `SessionGame` with the full M4 surface from the spec so later tickets do not fight the type. Fakes implement all of it; this ticket has no screens.
  - `applyTaskStep`, `claimTaskReward` (already on the real repository)
  - `closeDay(profileId, catalog)` returning the spec's `DaySummaryView` (expand today's `CloseDayResult`; reconstruct `lastClosedDay(profileId)` from existing tables — no schema shape change)
  - `listTaskProgress(profileId)` → `{ taskKey, status, rewardPaid }[]`
  - `dayState` gains `open: boolean`. When the next Игровой день is blocked, return the last closed day's buckets / n / dayId with `open: false` instead of throwing.
- Thin node tests for the public read/return shape only. Do not re-test reward math, rolling Этап, or `isDemo` unlock.
- Fake ports: `openDay` blocks after `closeDay` for a non-demo profile and stays open back-to-back for `isDemo`; `closeDay` computes score / facts / meter deltas / stage explanation with enough fidelity for later UI tests; task progress + spawn + rewardPaid behave like the repository. `seedReturningChild` stays valid.
- Do not register TaskList / DaySummary / Demo screens yet.

## Done when

`SessionGame` and fakes expose the M4 reads/writes; node tests cover `lastClosedDay`, `listTaskProgress`, `dayState.open`, and expanded `closeDay`. `npm test` and `npm run typecheck` pass.

## Answer

SessionGame now returns `DaySummaryView` from `closeDay`, reloads it via `lastClosedDay` from existing tables, lists `{ taskKey, status, rewardPaid }`, and keeps hub `dayState` with `open: false` after a close. Fakes block a non-demo `openDay` after close and stay back-to-back for `isDemo`.

