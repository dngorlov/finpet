# 01 — Commit on Имя and spotlight «Как играть»

Status: resolved
Type: task

## Goal

Move `firstRun.complete` to valid Имя «Дальше». Replace pet-speech HowToPlay with a dim/spotlight overlay tour on the live hub after Пособие. Practice writes are no-ops. Replay from Словарик uses the same overlay.

## Pointers

- Spec: `.scratch/how-to-play-tour/spec.md`
- RNTL: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`
- Seam: `src/ui/__tests__/firstRunFlow.test.tsx` only (plus `content.test.ts` if hint shape changes)
- Do not add a tour-component test file

## Must

- Drop FirstRun `rules` phase. Имя «Дальше» completes the profile (dual-write pet name, Стартовый бюджет grant) and resets to StartingBudget. Failure stays on Имя with the existing retry alert.
- Meta `howToPlayDone`, unset on Удалить профиль. Unset → auto-start tour after Пособие «Понятно» (or immediately if that card is not shown). Set on skip or last «Дальше». `seedReturningChild` sets it so other suites stay live.
- Overlay: dim + hole + anonymous step copy + «Назад» / «Дальше» / «Пропустить». Not SpeechBubble, not petSays, not Помощник. Overlay «Дальше» teleports. Android Back = «Назад»; beat 1 = skip.
- Beats: Main/План → План buckets → Main/Магазин → Магазин Обед (confirm UI allowed, no debit) → Main/Копилка → Копилка Положить (no transfer) → Main/Задание card (skip beat if no card). Finish on Main.
- During tour: confirm plan, purchase, savings transfer/withdraw, TaskRun, Закончить день do not succeed. No fake buy success.
- Словарик «Как играть» starts the overlay on Main without a second Пособие card and without complete.
- Replace hint.json with seven versioned step bodies. Retire HowToPlay pet cards. Keep contentVersion 1.
- Do not change bead sliders, Имя cloud, Стартовый бюджет copy/amount, or live economy after the overlay is gone. Do not revert CONTEXT.md.

## Done when

`npm test` and `npm run typecheck` pass. Имя «Дальше» commits once. After Пособие the overlay is queryable. Skip/Купить-during-tour do not change balance beyond grant + Пособие. Returning child does not auto-start the tour. Словарик replay shows the overlay.

## Answer

Имя «Дальше» calls complete and opens Стартовый бюджет. After Пособие, a dim overlay walks seven beats on the live hub; Купить / confirm / Играть do not write. Skip and Словарик replay share the overlay. `howToPlayDone` is set on skip/finish and seeded for returning children. HowToPlay pet cards are gone. `npm test` 109/109; typecheck clean.

