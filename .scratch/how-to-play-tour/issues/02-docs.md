# 02 — Living docs for commit-on-Имя and spotlight tour

Status: resolved
Type: task
Blocked by: 01

## Goal

Update REQUIREMENTS and ROADMAP so Первый запуск commits on Имя and «Как играть» is the post-Пособие spotlight walkthrough. Append supersession comments on historical specs. Do not revert CONTEXT.md.

## Pointers

- Spec: `.scratch/how-to-play-tour/spec.md` (stories 44–46, Further Notes)
- `docs/REQUIREMENTS.md` (R1 Resolved; Appendix A steps 2–3)
- `docs/ROADMAP.md` (§2.5, §4.1–4.2 FirstRun/Main/Словарик, Appendix A first-launch, hint content bullet, M2)
- `.scratch/first-run-redesign/spec.md`, `.scratch/first-run-pet-name/spec.md`, `.scratch/first-run-name-cloud/spec.md`

## Must

- R1 / Appendix A: Имя writes the Профиль ребёнка; «Как играть» is the spotlight tour after Пособие, not three pet bubbles before Main.
- ROADMAP FirstRun is Питомец → Имя (commit) → StartingBudget → Main → Пособие → overlay tour. Replay from Словарик is the same overlay, no profile write.
- Historical specs keep their stories; append a Comments note that pet-card «Как играть» and commit-after-rules are superseded by `.scratch/how-to-play-tour/spec.md`.
- Do not edit `src/` or tests. Do not revert CONTEXT.md.

## Done when

Living docs describe commit-on-Имя and the spotlight walkthrough. Historical specs remain implemented history plus supersession comments.

## Answer

REQUIREMENTS R1 / Appendix A and ROADMAP §2.5, §4.1–4.2, first-launch flow, hint.json, and M2 now describe commit-on-Имя and the post-Пособие spotlight tour. Historical first-run specs have supersession comments. CONTEXT.md was left as the spotlight definition.

