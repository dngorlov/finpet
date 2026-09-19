# 02: FeedbackCard and Пособие

**What to build:** When Пособие is credited on first open of an Игровой день, the child sees a FeedbackCard (Баланс +10, cause, next step, «Понятно») as well as the existing ribbon. The same sheet component is ready for purchases and Копилка to reuse. Стартовый бюджет stays the dedicated +100 screen and does not get this sheet.

**Blocked by:** 01

**Status:** resolved

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (FeedbackCard, Пособие stories)
- Ticket 01 will have extended `SessionGame` and Main focus reload

## Must

- Shared FeedbackCard bottom sheet: only the delta rows that moved (Баланс / Копилка / Забота / Настроение) as icon + signed number, cause line, next-step line, «Понятно». Copy in the strings module keyed by movement kind.
- On Main, if `openDay` returns `allowanceCredited`, present the allowance FeedbackCard once for that visit. Keep the ribbon.
- Do not sheet the Стартовый бюджет grant.
- A navigation-root test: returning child whose day opens with Пособие sees the sheet and can dismiss it; first-run grant screen is unchanged.

## Done when

A child opening a new Игровой день can read why +10 arrived and dismiss the sheet. `npm test` and `npm run typecheck` pass.

## Answer

Shared FeedbackCard sheet shows only the deltas that moved. Main presents it when `openDay` credits Пособие; returning children do not see it. Стартовый бюджет is unchanged. First-run flow dismisses the sheet after the grant screen.
