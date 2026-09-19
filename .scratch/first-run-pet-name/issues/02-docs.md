# 02 — Align living docs with pet-only Имя

Status: resolved
Type: task

## Goal

Update REQUIREMENTS and ROADMAP so Первый запуск names only the Питомец. Append a supersession comment on the historical pet-first spec. Do not revert CONTEXT.md.

## Pointers

- Spec: `.scratch/first-run-pet-name/spec.md` (stories 50–52; implementation decision on docs)
- `docs/REQUIREMENTS.md` (R1 resolved line: game name + pet)
- `docs/ROADMAP.md` (§2.5, §3.1, §4.1 map, §4.2 FirstRun, §4.3 first launch)
- `.scratch/first-run-redesign/spec.md` (Comments only)
- `CONTEXT.md` (already updated; leave Профиль ребёнка as the pet’s name and appearance)

## Must

- REQUIREMENTS: profile = pet (name + appearance); naming phase is «Имя»; child game name is not collected.
- ROADMAP: phase sequence Питомец → Имя → «Как играть»; one pet-spoken field; leftover persistence `name` equals `petName`; keep appearance / «Как играть» / commit timing as they are.
- Historical spec: do not rewrite the old stories. Append a Comments note that «Имена» and the child game name were superseded by `.scratch/first-run-pet-name/spec.md`.
- Do not edit `src/` or tests. Do not add an ADR. Do not change the bead-sliders spec except if a sentence would become factually false about current naming — prefer leaving it as that effort’s historical scope.

## Done when

Living docs match the glossary. The historical first-run-redesign spec still reads as implemented history plus the supersession comment.

## Answer

Living FirstRun copy now names only the Питомец: REQUIREMENTS R1/R14 Resolved, ROADMAP §2.5 / §3.1 / §4.1 / §4.2 / §4.3. Profile = pet (name + appearance); phase is «Имя» with one pet-spoken field; leftover persistence `name` equals `petName`. Historical first-run-redesign stories left intact; Comments note that «Имена» and the child game name were superseded by `.scratch/first-run-pet-name/spec.md`. CONTEXT.md and bead-sliders spec untouched.
