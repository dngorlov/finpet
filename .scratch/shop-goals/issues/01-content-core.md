# 01: Catalog dreams, terms, funded progress math

**What to build:** Скейтборд / Телескоп / Велосипед join Магазин as one-shot Желаемые. `applyGoalProgress` reports funded without shrinking the pot. Словарик copy matches CONTEXT.md. `goals.json` is no longer a source of truth.

**Blocked by:** None (can start immediately)

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (Implementation Decisions: catalog, funded, docs-adjacent terms; Testing Decisions: content loader + core savings)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `assets/content/catalog.json`, `assets/content/goals.json`, `assets/content/terms.json`, `src/data/content.ts`, `src/data/__tests__/content.test.ts`, `src/core/savings.ts`, `src/core/__tests__/savings.test.ts`

## Must

- Catalog: optional boolean `once` (default false). Add Скейтборд 90 mood +12, Телескоп 160 +15, Велосипед 240 +18, all `once: true`. Length 11. `contentVersion` stays 1.
- Stop loading `goals.json` as the Цель list. `loadContent()` may still expose a derived `goals` view from optional catalog rows (`id`, `name`, `cost` = price, `description`) so FirstRun/demo compile until later tickets switch call sites to catalog.
- `applyGoalProgress`: `achieved` (or `funded`) when pot ≥ cost; `remaining` 0 then; **`potAfter` is the unchanged pot** (90/90 → potAfter 90, not 0; 100/90 → 100). Update `src/core/__tests__/savings.test.ts` literals.
- `terms.json`: Настроение grows from Желаемые only (no «когда Цель достигнута»). Цель / Копилка / Желаемые match CONTEXT.md (one shop dream; coins leave by Забрать or buying the Цель; some Желаемые once). Still 11 terms.
- Content node test: 11 catalog items including the three `once` rows at those prices/effects; no “three preset goals” from a separate file.
- Do not revert CONTEXT.md. Do not change repository auto-debit, screens, or `goalAchievedMoodBonus` call sites yet.

## Done when

`npm test -- src/data/__tests__/content.test.ts src/core/__tests__/savings.test.ts` and `npm run typecheck` pass.

## Answer

Catalog is 11 items at `contentVersion` 1. Скейтборд (90, mood +12), Телескоп (160, +15), and Велосипед (240, +18) are optional rows with `once: true`; other items default `once: false`. `loadContent()` no longer parses `goals.json`; it derives `goals` from optional catalog rows (`id`, `name`, `cost` = price, `description`) so FirstRun/demo still compile. `applyGoalProgress` sets `achieved` when pot ≥ cost, `remaining` 0 then, and leaves `potAfter` as the same pot (90/90 → 90, 100/90 → 100). Словарик Настроение grows from Желаемые only; Цель / Копилка / Желаемые match CONTEXT.md. Content tests no longer assert three preset goals from a file.

`npm test -- src/data/__tests__/content.test.ts src/core/__tests__/savings.test.ts` and `npm run typecheck` pass.
