# 01 — Pet-spoken Имя UI and flow tests

Status: resolved
Type: task

## Goal

Replace the two-field «Имена» phase with pet-spoken «Имя» and update the navigation-root first-run flow tests. Do not change living product docs (ticket 02).

## Pointers

- Spec: `.scratch/first-run-pet-name/spec.md` (stories 1–49, 53–54; implementation + testing decisions)
- `src/ui/screens/FirstRunScreen.tsx` (draft, `NamesPhase`, complete payload)
- `src/ui/strings.ts` (phase label, legends, new bubble chrome)
- `src/ui/components/SpeechBubble.tsx` (reuse; do not fork)
- `src/ui/__tests__/firstRunFlow.test.tsx`
- RNTL: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`

## Must

- Phase title «Имя». One SpeechBubble: empty «Меня зовут ____», else «Меня зовут » + current field value; whitespace-only keeps the blank. Bubble a11y label is that sentence, not `petSays`.
- One unlabeled TextInput, accessible name «Имя», `autoFocus`. No legends, placeholders, second field, or «А тебя как зовут?».
- PetView stays; omit `petName` so the image is appearance-only. No name caption under the sprite.
- Drop child game-name from the FirstRun draft. Complete writes the trimmed pet name to both `name` and `petName`. Commit still only after «Как играть» finish/skip.
- Validation unchanged: trim, 1–20 graphemes, blur message, disabled «Дальше» while invalid. Footer «Назад» + «Дальше». Keep keyboard tap handling.
- Tests: replace «Имена» / «Как тебя зовут в игре?» / «Как зовут питомца?» / «Миша» with «Имя» + one pet name. Cover empty bubble, live echo, single textbox, blur, graphemes, trim saving both profile fields, Back retention, failed complete retry. «Как играть» still uses `petSays("Пух", …)`. If focus is observable without asserting `autoFocus`, assert it; otherwise skip.
- No new test file. Do not migrate schema or change HowToPlay rule cards.

## Done when

`npm test` and `npm run typecheck` pass. Naming UI has one textbox named «Имя». Profile commit stores the same trimmed pet name in both name fields.

## Answer

Первый запуск naming is now a single «Имя» phase: the customized pet speaks «Меня зовут ____» / live-echoes the typed name, one unlabeled textbox named «Имя» sits under the bubble, and «Дальше» stays disabled until 1–20 graphemes after trim. The FirstRun draft dropped the child game name; finish/skip of «Как играть» writes that trimmed pet name to both persistence `name` and `petName`. `firstRunFlow.test.tsx` covers empty/live bubble, single field, blur, graphemes, Back retention, and retry. `npm test` 24/24 suites, 107/107 tests; typecheck clean on `feat/frpn-01`.
