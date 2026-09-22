# 02: Repository engine for shop-item Цели

**What to build:** Persistence and intent operations match the spec: deposit can fund without spending the pot; buy the Цель from Копилка; clear/switch Цель; one-shot ownership is a purchase; План actuals ignore Копилка-paid optionals.

**Blocked by:** 01

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (Implementation Decisions from “At most one active Цель” through “Целей: N”; Testing Decisions seam 1)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `src/data/repositories/gameRepository.ts`, `src/data/schema.ts`, `src/data/migrations.ts`, `src/data/__tests__/gameRepository.node.test.ts`, `src/core/config.ts`

## Must

- Active Цель is a catalog id or null. `setActiveGoal` accepts a non-owned optional id (catalog price); reject mandatory and owned `once`. `clearActiveGoal` sets null, does not move coins. Seed FirstRun/demo still `skateboard` (call-site updates can wait for 03 if createProfile input stays `activeGoalKey`).
- `once` ownership = a purchase row for that id, any pocket. Ignore old goals `status: achieved` as ownership. Migration: do not refund coins already auto-debited; drop ghost preset rows as needed so presets are not a parallel catalog.
- `transferToSavings` still debits Баланс / writes `savings_in`. If pot ≥ active price, return funded (`achieved`/`funded` true) for Celebration. **No** `savings_out` of the cost, **no** mood bonus, **no** clearing the Цель. Persist “this stint already celebrated funded.”
- New `purchaseFromSavings(profileId, dayId, item)`: active Цель is this item, pot ≥ price. Pot − price via savings `out`; purchase row; item meter; clear Цель; stamp bought-as-active-Цель; Баланс unchanged. Журнал one «Покупка: {name}», not «Из копилки». Not a Баланс credit (unlike withdraw).
- `purchase` from Баланс: if item is the active Цель, clear it and stamp bought-as-active-Цель. `once` items become owned. Pot unchanged.
- `actual.optional`, optional overspend, and `withinPlan` spend ignore Копилка-paid purchases. `actual.savings` remains today’s `savings_in`.
- Count bought-as-active-Цель for later «Целей: N» (expose on listGoals, a dedicated read, or purchase flags — public, not SQL in UI).
- Stop applying `METERS.goalAchievedMoodBonus`. Node tests cover the spec’s engine bullets. Do not build screens.

## Done when

`npm test -- src/data/__tests__/gameRepository.node.test.ts` and `npm run typecheck` pass.

## Answer

Repository public seam matches the spec. `createProfile` still takes `goals` + `activeGoalKey` but persists only the active catalog id (FirstRun/demo call sites can keep seeding `skateboard` in ticket 03). `setActiveGoal` accepts a `CatalogItem` (or a leftover string key), rejects Обязательные and owned `once`, and starts a new funded-celebration stint. `clearActiveGoal` sets null without moving coins.

`transferToSavings` still writes `savings_in` and debit Баланс. When pot ≥ price it returns `achieved: true` once per stint, leaves the pot, does not write `savings_out` of the cost, does not apply `METERS.goalAchievedMoodBonus`, and does not clear the Цель. `purchaseFromSavings` spends the pot only, writes a purchase journal line (not «Из копилки»), applies the item meter, stamps bought-as-active-Цель, and leaves Баланс still. Баланс `purchase` of the active Цель does the same stamp/clear and leaves the pot. `once` ownership is any purchase row. `boughtAsActiveGoalCount` is the public «Целей: N» read. `actual.optional` / `withinPlan` / day-close overspend ignore `paidFrom: savings`. Migration v3 drops inactive preset rows, does not treat old `status: achieved` as ownership, and does not refund auto-debits.

`npm test -- src/data/__tests__/gameRepository.node.test.ts` (24 tests) and `npm run typecheck` pass.
