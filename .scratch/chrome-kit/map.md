# Chrome kit — map

## Notes

`.scratch/chrome-kit/spec.md` and `.scratch/child-chrome-kit/spec.md` describe the same child-facing chrome pass. Implement against **chrome-kit**; the child-chrome-kit spec is the same work with slightly different wording.

This is a visual consistency pass. Do not change persistence, routing, first-run commit, economy, or copy meaning.

## Decisions-so-far

- One PR branch: `feat/chrome-kit`. Ticket branches: `feat/ck-NN-*` in worktrees under `/Users/dimagorlov/finpet-worktrees/`.
- Kit first, then screen migrations in parallel, then one flow-test ticket.
- ROADMAP §4 already records this chrome.
- 01 theme tokens: `type.section` / `type.button`, `colors.raisedFace|raisedEdge|disabledFace|badgeFill`, `radius.card`. Meter `fill` kept. See `src/ui/theme.ts`.
- 02 buttons: `PrimaryButton` replaces `AppButton`; `TextButton` added for later screens. See `.scratch/chrome-kit/issues/02-primary-text-buttons.md`.
- 03 kit primitives: `Chip` / `Card` / `Badge` / `NavTile` / `SpeechBubble` / `Screen` plus chrome strings in `src/ui/strings.ts`. Screens not migrated. See `.scratch/chrome-kit/issues/03-kit-primitives.md`.
- 04 MeterBar + BackButton: taller rounded track/fill (`spacing.l`, `radius.card`); BackButton stays the word «Назад» at ≥48 dp with `type.button`. See `src/ui/components/MeterBar.tsx`, `src/ui/components/BackButton.tsx`.
- 05 FirstRun pet/names: `Screen` pinned footer; kit `Chip`; names «Назад» is `TextButton`. Rules still render `HowToPlay` unwrapped. See `.scratch/chrome-kit/issues/05-migrate-first-run.md`.
- 06 HowToPlay: pet + name above kit `SpeechBubble`; primary and quiet skip/close (plus «Назад» as `TextButton`) in the pinned `Screen` footer. Replay host unchanged. See `.scratch/chrome-kit/issues/06-migrate-how-to-play.md`.
- 07 Main hub: one scrolling `Screen` with Badge strip, large centered PetView, labelled Настройки, MeterBars, Cards, 2×3 NavTiles, raised «Закончить день». See `.scratch/chrome-kit/issues/07-migrate-main.md`.
- 08 remaining screens: Glossary / StartingBudget / Settings / Stub consume `Screen` + `Card` + kit buttons; accordion, budget reset, and delete-profile unchanged. See `.scratch/chrome-kit/issues/08-migrate-remaining-screens.md`.
- 09 flow tests: first-run seam now covers chip checks, Этап badge, NavTile names, plan hint, and labelled Settings. See `.scratch/chrome-kit/issues/09-flow-tests.md`.

## Fog

None for the task graph. Device acceptance (360 dp, raised-edge press feel) stays out of automated tests.
