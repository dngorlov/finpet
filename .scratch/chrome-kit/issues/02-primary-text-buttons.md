# 02 — PrimaryButton and TextButton

Status: resolved
Type: task
Blocked by: 01

## Goal

Replace the flat `AppButton` with a raised `PrimaryButton` and add `TextButton` for quiet actions.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (PrimaryButton / TextButton / disabled / press)
- Theme: `src/ui/theme.ts` (after 01)
- Current: `src/ui/components/AppButton.tsx`
- Callers: `FirstRunScreen`, `HowToPlay`, `MainScreen`, `GlossaryScreen`, `StartingBudgetScreen`, `DevSettings`

## Must

- `PrimaryButton`: orange fill, darker bottom edge, rounded, min height 48. On press the face translates down and the edge collapses via `Pressable` `pressed` state — not Reanimated, not an M6 animation toggle. Disabled: flat grey, no edge, no translation, `aria-disabled`, still ≥48 dp. Do not only fade opacity.
- `TextButton`: text-styled, 48 dp min height, for «Пропустить», «Закрыть», and other quiet actions. Do not restyle `BackButton` here.
- Remove the parallel flat primary: rename/replace `AppButton` so callers import `PrimaryButton`. Mechanical import updates are in scope; do not change screen layout (pinned footers, chips, hub structure).
- Existing `firstRunFlow.test.tsx` must still pass (roles/names/disabled «Дальше» unchanged).
- Do not test translateY math.

## Done when

There is no `AppButton`. Primary actions use `PrimaryButton`. `TextButton` exists for later screen tickets. `npm test` and `npm run typecheck` pass.

## Answer

Replaced `AppButton` with `PrimaryButton` (orange raised face, darker edge, press via `Pressable` `pressed`: face drops and edge collapses; disabled is flat `colors.disabledFace` with `aria-disabled`, no opacity-only fade). Added `TextButton` for later quiet-action migrations; `BackButton` and HowToPlay `TextAction` left unchanged. Callers now import `PrimaryButton`. `npm test` (70) and `npm run typecheck` pass.
