# 05 — Migrate Первый запуск onto the kit

Status: resolved
Type: task
Blocked by: 02, 03, 04

## Goal

Первый запуск appearance and names consume `Screen`, `Chip`, `PrimaryButton`, and `TextButton` / `BackButton`. Phases, validation, and commit stay unchanged.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (FirstRun bullets, pinned footer, Chip)
- `src/ui/screens/FirstRunScreen.tsx` (delete local `ChipRow`)
- Rules phase still renders `HowToPlay` (ticket 06 owns that component)

## Must

- All three phases pin the primary in a `Screen` footer so «Дальше» / «Играть!» is reachable without scrolling past the pet. Names-phase «Назад» is a quiet `TextButton` or `BackButton`, not a second raised brick.
- Appearance pickers use kit `Chip` (visible check + `aria-selected`).
- Do not change draft state, grapheme validation, hardware back, or `firstRun.complete` timing.
- Existing flow tests must still pass (including selected «Вид 2» and disabled then enabled «Дальше»).

## Done when

Local chip styles are gone. `npm test` and `npm run typecheck` pass.

## Answer

Pet and names phases now use `Screen` with a pinned footer so «Дальше» stays reachable: kit `Chip` (`label` / `selected` / `aria-selected`) replaced local `ChipRow`; names «Назад» is a quiet `TextButton`, not a second `PrimaryButton`. Rules still `return <HowToPlay ... />` unchanged. Draft, grapheme validation, hardware back, and `firstRun.complete` timing are untouched. `npm test` (70) and `npm run typecheck` pass.
