# 04 — Restyle MeterBar and BackButton

Status: resolved
Type: task
Blocked by: 01

## Goal

Restyle the existing `MeterBar` and `BackButton` to the kit. Do not duplicate them.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (MeterBar, BackButton, 48 dp, not hearts)
- `src/ui/components/MeterBar.tsx`
- `src/ui/components/BackButton.tsx`

## Must

- `MeterBar`: taller rounded track/fill; keep icon + number via existing `strings.meterLine`. Do not switch to discrete hearts. Do not change the `fill` token into a brand-green success color.
- `BackButton`: still the word «Назад» on a ≥48 dp target; restyle to the kit; never icon-only, never X.
- Public props and accessible names stay the same so `firstRunFlow.test.tsx` keeps passing.

## Done when

Both components use kit tokens. `npm test` and `npm run typecheck` pass.

## Answer

Restyled in place: MeterBar uses a taller pill track/fill (`spacing.l` + `radius.card`) and still shows icon + `strings.meterLine`; `colors.fill` unchanged. BackButton still renders the word «Назад» on a `minTarget` (48) hit area with `type.button`, never icon-only. Public props and accessible names unchanged.
