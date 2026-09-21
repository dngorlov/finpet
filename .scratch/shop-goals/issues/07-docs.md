# 07: REQUIREMENTS and ROADMAP

**What to build:** Living docs stop requiring three goal presets, auto-debit on reach, and Настроение +10 when Копилка hits the price.

**Blocked by:** 01

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (stories 49–51; Implementation Decisions: Docs)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `docs/REQUIREMENTS.md`, `docs/ROADMAP.md` §4.2 Магазин/Копилка, §5.1 catalog, §5.2 goals.json, `CONTEXT.md`

## Must

- REQUIREMENTS / ROADMAP: catalog 8 → 11 with `once` on the three dreams; Копилка deposit funds without spending; buy the Цель from the pot; no reach mood bonus; Цель is a Магазин Желаемое, at most one.
- Retire goals-as-separate-presets in §5.2 (catalog is the source).
- Do not revert CONTEXT.md. Do not add an ADR. «Как играть» bodies stay unless a sentence is false (ticket 01 already fixed terms.json).
- Append supersession notes on M1/M3 scratch stories that required auto-debit or +10 if those files would send a later agent backwards; keep them marked resolved.

## Done when

Docs grep for “three presets” / “Настроение +10” on reach no longer describe current product as required. No test changes required beyond what 01 already did.
