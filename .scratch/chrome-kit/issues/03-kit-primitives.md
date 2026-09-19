# 03 — Chip, Card, Badge, NavTile, SpeechBubble, Screen

Status: ready-for-agent
Type: task
Blocked by: 01

## Goal

Add the shared chrome primitives and the centralized strings they need. Do not migrate screens in this ticket.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (kit members, Chip/Card/Badge/NavTile/SpeechBubble/Screen)
- Theme: `src/ui/theme.ts` (after 01)
- Strings: `src/ui/strings.ts`
- Local copies to replace later: `ChipRow` in `FirstRunScreen.tsx`, bubble in `HowToPlay.tsx`, card/tile in `MainScreen.tsx`

## Must

- `Screen`: cream background, padding, optional pinned footer (scroll content above; primary + quiet actions in the footer). Safe layout on top of the existing `SafeAreaView` in `FinPetApp`.
- `Card`: white, kit card radius, padding.
- `Chip`: label plus a visible check when selected; `aria-selected`; highlight color extra, not the only cue. Hide the check from the reading order so TalkBack does not announce it twice.
- `Badge`: icon + word + number. Accessible/visible text for Баланс/Копилка must remain findable as `Баланс N` / `Копилка N` (existing flow test). Этап uses the domain word «Этап» plus the stage name.
- `NavTile`: pictogram + word, raised like a skill tile. Accessible name is the word only (pictogram `aria-hidden`). Highlighted/needed state: visible check plus hint text, not color alone.
- `SpeechBubble`: body in a rounded card; small tail pointing up. Caller supplies the TalkBack label (`strings.petSays`); do not change announcement copy.
- Pictograms may be emoji placeholders. New visible chrome words go in `src/ui/strings.ts`. No English all-caps. No «выбрано» string if the check is visible and `aria-selected` is set.
- Do not add a per-component screenshot/snapshot suite.

## Done when

New components live under `src/ui/components/` (and `Screen` if that is the right home), strings compile, and no screen has been rewritten yet. `npm run typecheck` passes.
