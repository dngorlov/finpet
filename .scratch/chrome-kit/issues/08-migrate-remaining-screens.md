# 08 — Migrate Словарик, Стартовый бюджет, Settings, stubs

Status: resolved
Type: task
Blocked by: 02, 03

## Goal

Leftover child-facing surfaces use `Screen` / `Card` / kit buttons so they belong to the same game.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (stories 23–24; remaining screens)
- `src/ui/screens/GlossaryScreen.tsx`
- `src/ui/screens/StartingBudgetScreen.tsx`
- `src/ui/screens/SettingsScreen.tsx`
- `src/ui/screens/StubScreen.tsx`
- `src/ui/components/DevSettings.tsx` (PrimaryButton already from 02)

## Must

- Wrap these screens in `Screen` (scrolling content; no pinned footer unless they are already a short one-CTA modal like StartingBudget — a single primary in content is fine).
- Glossary terms and «Как играть» sit in Card/button chrome. Do not snapshot glossary layout.
- StartingBudget «Понятно» is `PrimaryButton`.
- Stub back stays `BackButton` (word «Назад»).
- Do not change glossary accordion behavior, starting-budget navigation reset, or Settings delete-profile behavior.

## Done when

These screens no longer copy cream/card/button styles locally. `npm test` and `npm run typecheck` pass.

## Answer

Glossary, StartingBudget, Settings, and Stub now use `Screen` / `Card` / kit buttons instead of local cream padding. Glossary terms stay accordion `Pressable`s (`aria-label={term.term}`, `aria-expanded`) inside Cards; «Как играть» is `PrimaryButton` in a Card. StartingBudget pins «Понятно» as a footer `PrimaryButton` and still `navigation.reset`s to Main. Stub/Settings keep `BackButton` «Назад»; delete-profile is unchanged. `npm test` (70) and `npm run typecheck` pass.
