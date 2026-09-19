# 01 — Centered FeedbackCard and tooltip «Как играть»

Status: resolved
Type: task

## Goal

Center every FeedbackCard; dim + chip + «Дальше» only on tutorial Пособие. Rework «Как играть» to tooltip + tap-to-open hub tiles, freeze scroll, destination «Дальше». Update first-run flow tests.

## Pointers

- Spec: `.scratch/how-to-play-tooltip/spec.md`
- RNTL: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`
- Seam: `src/ui/__tests__/firstRunFlow.test.tsx`

## Must

- FeedbackCard centered; tap-catch; dim only tutorial Пособие; that card chip «Начало игрового дня», «Дальше», no cause/nextStep/«Понятно»/tap-outside. Daily Пособие: chip, «Понятно», no dim. Other cards: cause + nextStep + «Понятно». Android Back does not dismiss tutorial Пособие.
- Hub beats: tap tile to go; no overlay «Дальше». Destination beats: tooltip + «Дальше». Practice no-ops unchanged. Frozen scroll. Tooltip next to hole. Seven new bodies.
- Tests: StartingBudget «Понятно»; tutorial Пособие «Дальше»; tap План not overlay Дальше; shop Дальше + Купить no debit; skip/back/replay.

## Done when

`npm test` and `npm run typecheck` pass.

## Answer

Centered FeedbackCard with tutorial dim + chip + «Дальше»; tooltip overlay; hub tap-to-go (no overlay «Дальше» on План/Магазин/Копилка); frozen scroll; Q9 copy in `hint.json`. `npm test` 109/109; typecheck clean.
