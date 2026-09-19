# 06: Economy loop flow tests (Appendix A 5, 7–9)

**What to build:** One navigation-root flow proves the M3 loop a child can actually play: confirm a План, buy mandatory + optional, fail Игрушка with a way out, save toward a Цель, see FeedbackCard on each movement, and read those rows in Журнал. Main badges, meters, and «План готов» match afterwards.

**Blocked by:** 03, 04, 05

**Status:** resolved

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (Testing Decisions, AC)
- Prior art: `src/ui/__tests__/firstRunFlow.test.tsx`
- RNTL v14: async `render`, `screen`, `userEvent`, role/name first

## Must

- Prefer one (or few) flow tests at `FinPetApp` + fake ports, not per-screen suites that re-assert layout.
- Drive a returning child through Appendix A 5, 7, 8, 9. Step 6 remains the Задания stub (reachable from BlockedSheet).
- Assert FeedbackCard after Пособие (if shown), purchase, transfer; BlockedSheet options; journal labels; hub numbers.
- Do not re-test M1 invariants. Do not snapshot styles.
- Keep first-run flow tests green.

## Done when

`npm test` covers the M3 loop at the navigation-root seam and `npm run typecheck` passes.

## Answer

`economyFlow.test.tsx` walks a returning child through План, Магазин (including blocked Игрушка), Копилка, and Журнал. `npm test` 81, typecheck and lint clean.
