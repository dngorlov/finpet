# 01: Copy, Словарик, tour tooltip

**What to build:** Locked kid copy for the План promise, leftover strings, 11th Словарик term **План**, and the `plan-buckets` tooltip body. Schema length 10 → 11. `CONTEXT.md` **План** stays.

**Blocked by:** None (can start immediately)

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/plan-rework/spec.md` (Implementation Decisions: draft copy, leftover strings, Словарик, «Как играть»; Testing Decisions: content loader)
- Map: `.scratch/plan-rework/map.md`
- Prior art: `assets/content/terms.json`, `assets/content/hint.json`, `src/data/content.ts`, `src/data/__tests__/content.test.ts`, `src/ui/strings.ts`

## Must

- Strings for: promise line, Копилка-row extra, confirm body (replace «пойдёт»), «вчера N», «Осталось N», «сверх плана N», leftover accessible name with bucket, «в плане останется N», «Это сверх плана.»
- `terms.json`: id `plan`, term «План», definition from the spec, after Пособие. Zod `length(11)`. `contentVersion` stays 1.
- `hint.json` `plan-buckets` body: «Раздели монеты на три кучки. Это обещание, не покупка.» `main-plan` unchanged.
- Content node test: 11 terms including План in that order; `plan-buckets` body is the new sentence.
- Do not revert CONTEXT.md **План**. Do not change screens yet.

## Done when

`npm test -- src/data/__tests__/content.test.ts` and `npm run typecheck` pass. Screens still compile against the new strings.

## Answer

Locked promise copy lives in `src/ui/strings.ts` (`planPromise`, `planSavingsExtra`, `confirmPlanBody` without «пойдёт», leftover/yesterday helpers). Словарик is 11 terms: **План** (`id: plan`) sits after Пособие; `content.ts` schema is `length(11)`; `contentVersion` stays 1. `plan-buckets` body is «Раздели монеты на три кучки. Это обещание, не покупка.» `main-plan` and CONTEXT.md **План** are unchanged. No screen or control edits.

`npm test -- src/data/__tests__/content.test.ts`: 5 passed, 5 total. `npm run typecheck`: pass.
