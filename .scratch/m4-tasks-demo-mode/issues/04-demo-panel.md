# 04: Thin Демо-режим panel

**What to build:** Взрослый раздел opens a demo panel (no arithmetic gate). Confirm creates/switches to a dedicated `isDemo` profile; exit restores the child; «Сбросить демо» recreates the demo at initial state. Demo Main shows «Демо: дни идут подряд» and all six Задания are unlocked.

**Blocked by:** 01

**Status:** resolved

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (stories 37–45, 53; demo operations; ADR-0002)
- Writes: existing `createProfile({ isDemo })` / `deleteProfile`; meta `activeProfileId` + new `childProfileId`
- Do not swap live SystemClock.

## Must

- Replace the Adult stub with a Demo screen: toggle on → confirm sheet «Демо создаёт отдельный тестовый профиль»; toggle off exits; «Сбросить демо» when a demo profile exists. No AdultGate, no delete-child, no parent bonus.
- Enter / exit / reset exactly as the spec (session-level, compose existing writes). Demo names «Демо», default `sp1/c1/a1`, skip Первый запуск and Стартовый бюджет, land on Main.
- Demo Main banner «Демо: дни идут подряд». Unlock list uses `profile.isDemo` (all six non-correction tasks). Child profile untouched on exit.
- Cover at the navigation-root seam: enter demo (confirm) → Main banner + six unlocked titles; reset restores day 1 / Новичок / grant-only journal (until the next Пособие); exit returns to the child with original Баланс and task progress. Five back-to-back days wait for tickets 03+06 if DaySummary is not yet present — then at least `closeDay` + `openDay` via UI once if 03 has landed, otherwise assert unlock/banner/reset/exit only.

## Done when

A juror can enter, reset, and leave Демо-режим without mutating the child profile. `npm test` and `npm run typecheck` pass.

## Answer

Взрослый раздел is a Demo panel: confirm creates/switches a dedicated `isDemo` profile (names «Демо», `sp1/c1/a1`), Main shows «Демо: дни идут подряд» and all six unlocked titles via `unlockedTasks(..., profile.isDemo)`, «Сбросить демо» recreates that profile, and exit restores `childProfileId`. Live SystemClock is unchanged. Five consecutive UI days wait for 03+06.
