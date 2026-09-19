# 02 — Wire Питомец phase and flow tests

Status: resolved
Type: task
Blocked by: 01

## Goal

Replace FirstRun appearance Chip rows with three BeadSliders and update the navigation-root first-run flow tests. Do not restyle Имена / Как играть.

## Pointers

- Spec: `.scratch/first-run-bead-sliders/spec.md` (stories 1–52, testing decisions)
- Ticket 01 BeadSlider
- `src/ui/screens/FirstRunScreen.tsx` (`AppearanceGroup`)
- `src/ui/strings.ts` (legends, option names, pictogram home)
- `src/ui/__tests__/firstRunFlow.test.tsx`
- RNTL: `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`

## Must

- Three sliders: Вид 🐣, Окрас 🎨, Аксессуар 🎀. Pictograms centralized in strings. 🐾 is not the Вид emoji.
- Same keys, defaults, draft, PetView, commit as today. Remove Chip from this screen only.
- Modest extra gap around the three tracks.
- Tests: drop hidden-check assertion on appearance selection; keep `role="button"` + `toBeSelected()` + names «Вид 1» / «Вид 2». Cover one Окрас tap and one Аксессуар tap (preview + selected, sibling not selected). Assert legends «Вид» / «Окрас» / «Аксессуар» on the phase. Unselected option buttons are not disabled. Emoji not part of circle accessible names. Do not assert traveler/line as accessible elements.
- Happy path, Back retention, remount defaults keep pressing «Вид 2» without Chip checks.
- No new component test file. Drag/snap is device-only.

## Done when

`npm test` and `npm run typecheck` pass. FirstRun appearance no longer imports Chip.
