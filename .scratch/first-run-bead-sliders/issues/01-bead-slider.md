# 01 — BeadSlider component

Status: ready-for-agent
Type: task

## Goal

Add one reusable discrete bead-slider control under shared UI components. Do not wire FirstRun or change tests in this ticket.

## Pointers

- Spec: `.scratch/first-run-bead-sliders/spec.md` (visual recipe, gestures, TalkBack)
- Notes: agent store `frbs-exploration.md`
- Patterns: `src/ui/components/AmountStepper.tsx`, `src/ui/components/Chip.tsx`, `src/ui/theme.ts`

## Must

- Generic over a `keys` list + current `value` + `onChange`. Legend string + pictogram string as props (caller supplies copy).
- Large identical circles (≥48 dp) on a track-colored line through centers; dim bead in every circle; accent bead at rest in the selected circle.
- While dragging: dim beads stay; separate accent traveler on the line; `onChange(nearest)` as the finger moves; snap on release; midpoint → lower index; no animation; no cancel-on-leave.
- Whole track is the drag surface. Circle taps fire `onChange` via button `onPress` so flow tests can press by accessible name.
- Each circle: `role="button"`, `aria-label` from caller, `aria-selected`, never disabled just because unselected.
- Line, traveler, pictogram, and inner beads excluded from the reading order.
- Use existing `accent` / `disabledFace` / `card` / `track` tokens. Do not add theme keys. Do not tint stops with pet colors.
- No per-stop visible labels. No check mark.
- Do not add this control to the chrome-kit member list.

## Done when

The component compiles (`npm run typecheck`). FirstRun still uses Chips. `npm test` still passes.
