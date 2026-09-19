# 01 — Compact Имя cloud and flow tests

Status: resolved
Type: task

## Goal

Replace the titled form-style Имя phase with a compact speech cloud above a centered Питомец. Update the navigation-root first-run flow tests. Do not restyle Как играть.

## Pointers

- Spec: `.scratch/first-run-name-cloud/spec.md`
- `src/ui/screens/FirstRunScreen.tsx` (`NamePhase`)
- `src/ui/strings.ts`
- `src/ui/__tests__/firstRunFlow.test.tsx`
- RNTL: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`

## Must

- No visible «Имя» title. Centered cluster: compact cloud (hug contents, tail down) then pet (appearance-only image).
- Cloud: static «Меня зовут» + chip (card fill, track border, ≥48 dp) with placeholder «____», trailing ✏️ `aria-hidden`, field name «Меня зовут». No autofocus. Whitespace-only keeps the placeholder. Chip scrolls horizontally.
- Footer «Назад» / «Дальше» unchanged. Validation under the cluster. Draft, graphemes, dual-write commit unchanged.
- Tests: textbox «Меня зовут»; `queryByText("Имя")` absent on the phase; placeholder then typed value; one field; «Как играть» still `petSays`. No new test file. Do not change HowToPlay / kit SpeechBubble.

## Done when

`npm test` and `npm run typecheck` pass. Naming phase has one textbox named «Меня зовут» and no heading «Имя».

## Answer

Имя is a centered pet with a compact cloud above (tail down): «Меня зовут» plus a name-tag chip (placeholder «____», trailing ✏️, accessible name «Меня зовут»). No title, no autofocus, footer unchanged. `firstRunFlow.test.tsx` queries the «Меня зовут» textbox and asserts heading «Имя» is gone.

