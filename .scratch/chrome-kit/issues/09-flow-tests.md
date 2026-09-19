# 09 — Extend the first-run flow coverage

Status: resolved
Type: task
Blocked by: 05, 06, 07, 08

## Goal

Extend `src/ui/__tests__/firstRunFlow.test.tsx` for chrome-visible behavior. Do not add a parallel chrome suite or repository tests.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (Testing Decisions)
- RNTL v14: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`
- Seam: `FinPetApp` + `createFakePorts` / `seedReturningChild`

## Must

Keep the existing journey passing, and add assertions for:

- Selected appearance `Chip` is selected (`aria-selected` / `toBeSelected`) and a visible check is present (query the check as non-accessible decoration, or assert selected + check text if it is visible to sighted users without being the accessible name).
- Names still disable then enable «Дальше».
- «Как играть» still announces the bubble once via `strings.petSays`; decorative pet stays out of that reading order.
- Skip/finish still commit once; replay still «Готово» / «Закрыть» with no second commit.
- Returning child / Main: Badge texts for Этап / Баланс / Копилка; NavTiles still named План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел; highlighted План includes «Составь план дня»; Settings still opens.
- Glossary walk only as far as the existing flow already goes.

Do not assert shadow height, hex, radius, translateY, or snapshot the tree for styling.

## Done when

`npx jest src/ui/__tests__/firstRunFlow.test.tsx` passes. No new test files for chrome.

## Answer

Extended `src/ui/__tests__/firstRunFlow.test.tsx` only (same `FinPetApp` + fake ports seam). No production changes, no new test files, no visual snapshots.

Chrome assertions added:

- Selected appearance Chip: `toBeSelected()` + accessible name stays the option word; `✓` is queried with `includeHiddenElements` so it is in the tree for sighted users but not the accessible name.
- Names «Дальше»: still `toBeDisabled()` until both fields are filled, then `toBeEnabled()`.
- «Как играть»: one `getByLabelText` via `strings.petSays`; decorative PetView is not in the reading order (`queryByRole("img")` absent). Replay still «Готово» / «Закрыть» with a single commit.
- Main / returning child: Badge texts `Этап Новичок`, `Баланс 110`, `Копилка 0`; NavTiles named План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел; highlighted План includes «Составь план дня»; Settings remains a labelled button that opens.

`npx jest src/ui/__tests__/firstRunFlow.test.tsx` and `npm run typecheck` both passed.

