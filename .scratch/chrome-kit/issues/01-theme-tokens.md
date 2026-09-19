# 01 — Expand theme tokens

Status: claimed
Type: task
Blocked by:

## Goal

Expand `src/ui/theme.ts` so the chrome kit has a type scale and raised/disabled/card/badge tokens without leaving cream/orange.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (Implementation Decisions, theme bullets)
- Twin spec: `.scratch/child-chrome-kit/spec.md` (same theme rules)
- File: `src/ui/theme.ts`

## Must

- Type scale: `title` / `section` / `body` / `button`. Keep `body` and `button` ≥ 16. Keep existing `title: 28` and `body: 16` unless a section size is required between them.
- Add tokens for raised-face, raised-edge, disabled-face, card radius, and badge fill. Stay in cream/orange. Do not add a Duo-green success token. Keep existing meter `fill` (it is not a success-brand color).
- Do not migrate screens or invent components in this ticket.

## Done when

`src/ui/theme.ts` exports the new tokens and existing screens still typecheck against the old names they already use (`type.title`, `type.body`, `colors.accent`, etc.).
