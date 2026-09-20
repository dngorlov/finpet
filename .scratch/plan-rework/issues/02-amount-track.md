# 02: Draft amount track and hold-repeat

**What to build:** Optional track on `AmountStepper` (integer 0…max) plus hold-to-repeat on −/+. Default stays no track so Копилка deposit/withdraw is unchanged.

**Blocked by:** None (can start immediately)

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/plan-rework/spec.md` (draft control, TalkBack, stories 7–10, 38–39, 43)
- Map: `.scratch/plan-rework/map.md`
- Prior art: `src/ui/components/AmountStepper.tsx`, `src/ui/components/MeterBar.tsx` (track/fill tokens only). Do **not** reuse BeadSlider.

## Must

- Optional `showTrack`. When set, render a horizontal track; drag sets any integer from 0 through `max` (required when the track is on). Track is `aria-hidden` / not a named control. Value text and −/+ names unchanged.
- Tap −/+ still ±1 (existing `onPress` — flow tests depend on it). Press-and-hold repeats ±1 after a short delay. Do not assert hold timing in tests.
- No track when `showTrack` is omitted. Savings callers stay as they are.
- Touch targets on −/+ stay ≥48 dp. Existing theme tokens only.

## Done when

`npm run typecheck` passes. Existing flow tests that press «…, больше / меньше» still compile; do not add a new test file.
