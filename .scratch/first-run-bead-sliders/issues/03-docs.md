# 03 — Supersede Chip-row appearance docs

Status: resolved
Type: task

## Goal

Rewrite living docs that still require Chip rows / checks for Первый запуск appearance. Chip stays the kit picker everywhere else.

## Pointers

- Spec: `.scratch/first-run-bead-sliders/spec.md` (story 49, implementation decision on docs)
- Notes: agent store `frbs-exploration.md`
- `docs/ROADMAP.md` FirstRun paragraph
- `.scratch/chrome-kit/spec.md`
- `.scratch/child-chrome-kit/spec.md`
- `.scratch/first-run-redesign/spec.md`

## Must

- ROADMAP FirstRun: live preview plus bead sliders for Вид / Окрас / Аксессуар; selected cue is the accent bead in a circle, not a Chip check.
- chrome-kit and child-chrome-kit: FirstRun appearance is bead sliders; Chip check+`aria-selected` remains for remaining Chip uses. Flow-test bullets must not require an appearance check glyph.
- first-run-redesign: note that appearance pickers are bead sliders (that spec never said Chip by name).
- Do not add slider/bead terms to `CONTEXT.md`. Do not revert Окрас / Аксессуар glossary entries.
- Do not rewrite resolved chrome-kit issue Answers as if Chip never shipped.

## Done when

Those living docs describe bead sliders for this phase. Kit Chip contract elsewhere is unchanged.
