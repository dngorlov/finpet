# 07 — Migrate Main hub onto the kit

Status: resolved
Type: task
Blocked by: 02, 03, 04

## Goal

Main is one scrolling hub with kit chrome. No bottom tabs, no lesson path.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (Main structure, Badge, NavTile, Cards, Settings)
- `src/ui/screens/MainScreen.tsx` (delete local card/tile styles)

## Must

Top to bottom:

1. Badge strip: Этап, Баланс, Копилка (icon + word + number). Keep `Баланс N` / `Копилка N` findable. Show «Этап» plus «Новичок» (etc.).
2. Large centered `PetView` (optional size on `PetView` is allowed; default FirstRun size may stay).
3. Settings remains a labelled control (visible word «Настройки», not ⚙-only). Accessible name stays «Настройки».
4. Chunky `MeterBar`s (from 04).
5. Optional Пособие ribbon.
6. Цель `Card` and Задание `Card`.
7. 2×3 `NavTile`s with placeholder pictograms; accessible names stay План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел.
8. Highlighted План: check plus «Составь план дня», never color-only.
9. Raised «Закончить день».

Do not change hub data loading, `openDay`, or stub navigation.

## Done when

Local tile/card copies are gone. `npm test` and `npm run typecheck` pass.

## Answer

Main is one scrolling `Screen` (no pinned footer): Badge strip (Этап / Баланс / Копилка), large centered `PetView` (`size={200}`), labelled `TextButton` «Настройки», MeterBars, optional Пособие ribbon, Цель/Задание `Card`s, 2×3 kit `NavTile`s (План `needed` + hint), raised «Закончить день». Local tile/card styles removed. Hub loading and stub navigation unchanged. `npm test` (70) and `npm run typecheck` pass.

Superseded 2026-09-20 by `.scratch/play-status-strip/spec.md`: the scrolling Badge trio and labelled mid-page Настройки are replaced by the pinned play-screen strip (⚙-only Настройки; Копилка pot on the tile).
