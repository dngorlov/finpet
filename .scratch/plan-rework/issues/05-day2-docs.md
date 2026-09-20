# 05: Next-day yesterday, Словарик in flows, living docs

**What to build:** After demo day close + «Следующий день», draft План shows «вчера» from closed actuals. First-run План has no yesterday; Словарик lists План. REQUIREMENTS / ROADMAP / supersession notes. Do not revert CONTEXT.md.

**Blocked by:** 01, 03

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/plan-rework/spec.md` (stories 13–16, 34–37, 45–47; docs bullet; Testing Decisions: firstRunFlow, dayCloseDemoFlow)
- Map: `.scratch/plan-rework/map.md`
- Prior art: `src/ui/__tests__/firstRunFlow.test.tsx`, `src/ui/__tests__/dayCloseDemoFlow.test.tsx`, `docs/REQUIREMENTS.md` §5 §11, `docs/ROADMAP.md` §2.5 §4.2 Plan/Progress §5.2, `.scratch/m3-economy-loop-ui/issues/01-plan-from-main.md`, `.scratch/chrome-kit/spec.md` if it required +1-only План steppers

## Must

- `dayCloseDemoFlow`: after advance, open План and assert «вчера» matches that closed day’s actuals (zeros are fine when they spent 0).
- `firstRunFlow`: buckets tooltip uses content body (already from hints — update any hardcoded old sentence); first-day План has no «вчера»; Словарик shows 11 terms including План.
- Docs: REQUIREMENTS §5 track + leftover follow-through; §11 eleven terms including План. ROADMAP Plan zones, Словарик count, §5.2. Supersession note on M3/chrome-kit stories that required План as +1-only steppers with no promise copy.
- Sister flows: only fix queries that break (extra leftover/promise text, 11 terms).

## Done when

`npm test` and `npm run typecheck` pass. Living docs match the spec.
