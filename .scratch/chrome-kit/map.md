# Chrome kit — map

## Notes

`.scratch/chrome-kit/spec.md` and `.scratch/child-chrome-kit/spec.md` describe the same child-facing chrome pass. Implement against **chrome-kit**; the child-chrome-kit spec is the same work with slightly different wording.

This is a visual consistency pass. Do not change persistence, routing, first-run commit, economy, or copy meaning.

## Decisions-so-far

- One PR branch: `chrome-kit`. Tickets live under `.scratch/chrome-kit/issues/`.
- Kit first, then screen migrations in parallel, then one flow-test ticket.
- ROADMAP §4 already records this chrome.
- 01 theme tokens: `type.section` / `type.button`, `colors.raisedFace|raisedEdge|disabledFace|badgeFill`, `radius.card`. Meter `fill` kept. See `src/ui/theme.ts`.
- 04 MeterBar + BackButton: taller rounded track/fill (`spacing.l`, `radius.card`); BackButton stays the word «Назад» at ≥48 dp with `type.button`. See `src/ui/components/MeterBar.tsx`, `src/ui/components/BackButton.tsx`.

## Fog

None for the task graph. Device acceptance (360 dp, raised-edge press feel) stays out of automated tests.
