# M3 — Economy loop UI

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 M3, §4.2 screens #5–7, 11, 16, §2.1, §3.3 · `docs/REQUIREMENTS.md` Appendix A 5, 7–9, R5–R7, R9, R11 · `CONTEXT.md` · ADR-0001 · ADR-0002 · M1/M2 comments

## Problem Statement

A child who finishes Первый запуск lands on Main with Баланс and a highlighted «Составь план дня», but План, Магазин, and Копилка are stubs. They cannot distribute Монеты, buy Обязательные / Желаемые расходы, save toward a Цель, or see why Баланс and meters moved. Appendix A steps 5, 7–9 (plan, purchases including insufficient funds, savings, feedback) are not playable, so the Игровой день loop has no economy UI.

## Solution

Ship the economy screens exactly as ROADMAP §4.2 #5–7, 11, 16. From Main the child confirms a План across Обязательные / Желаемые / Копилка, buys from the eight-item catalog (pre-purchase sheet, confirm, insufficient-funds block with a way out), and uses Копилка (three Цели, deposits, withdrawal with a second confirm that shows the date shift). Every coin or meter movement ends on a FeedbackCard. Прогресс gains Журнал (and keeps Словарик); Итоги stays an empty next-step until M4 closes a day. Destinations that still belong to later milestones remain stubs with an explanation — never a dead end.

## User Stories

1. As a ребёнок whose План is not confirmed, I want the План tile highlighted with «Составь план дня», so that I know the next required action.
2. As a ребёнок, I want План to open from Main instead of a stub, so that I can start the Игровой день loop.
3. As a ребёнок on План, I want to see how many Монеты I can spend (Баланс including today's Пособие), so that I plan with the real available amount.
4. As a ребёнок, I want three bucket rows — Обязательные, Желаемые, Копилка — each with a pictogram and −/+ steppers, so that I practice Три решения.
5. As a ребёнок, I want the running total compared to available and a remainder line «Останется свободных: N», so that leftover coins are visible.
6. As a ребёнок, I want confirm blocked when the total exceeds available, with a validation line, so that I cannot plan money I do not have.
7. As a ребёнок, I want a draft to stay editable, so that I can change buckets before I commit.
8. As a ребёнок, I want «Подтвердить план» to open a confirmation sheet that explains what the plan does, so that confirm is an informed choice.
9. As a ребёнок who confirms a valid plan, I want it locked for the Игровой день, so that plan-vs-actual stays honest.
10. As a ребёнок after confirm, I want Main's План tile to show «План готов» instead of the compose hint, so that the hub reflects the confirmed plan.
11. As a ребёнок during the day, I want План to show план / потрачено columns per bucket, so that I see actual spending against the plan.
12. As a ребёнок, I want confirming a plan not to move Монеты by itself, so that Копилка and Магазин remain the places money actually changes.
13. As a ребёнок who taps «Закончить день» without a confirmed plan, I want the existing prompt to compose the plan first, so that I cannot close a day that never started.
14. As a ребёнок who taps «Закончить день» after a confirmed plan, I want a short explanation that Итоги дня come next and a way back, so that the button is not a dead end before M4.
15. As a ребёнок, I want Магазин to open from Main with tabs «Обязательное» / «Желаемое», so that I can tell needs from wants before I buy.
16. As a ребёнок, I want all eight catalog items with name, price, category, pet-impact preview (meter icon + delta), and «после покупки: N монет», so that I see the cost and the pet effect before tapping.
17. As a ребёнок, I want tapping an item to open a sheet with the full description, «Купить», and «Отложить», so that I can postpone without buying.
18. As a ребёнок who chooses «Купить», I want a separate confirm, so that a purchase is never a single accidental tap.
19. As a ребёнок who confirms a purchase I can afford, I want Баланс debited, the purchase recorded, and the pet meter moved, so that caring and wanting have visible effects.
20. As a ребёнок after a successful purchase, I want a FeedbackCard with Баланс and meter deltas, a cause line, and a next step, so that nothing changed silently.
21. As a ребёнок who already bought an item today, I want a «Куплено» badge, so that I can see what I already chose; buying again is still allowed.
22. As a ребёнок who cannot afford an item (including Игрушка at 25 when Баланс is lower), I want a BlockedSheet «Не хватает N монет» and no debit, so that Баланс never goes negative.
23. As a ребёнок on that BlockedSheet, I want three ways out — дождаться Пособия, выполнить Задание, отложить покупку — so that a wrong-path purchase is never a dead end.
24. As a ребёнок who picks «выполнить Задание» from the block, I want to reach the existing Задания stub, so that the option is a real in-app path even before the runner exists.
25. As a ребёнок, I want Копилка to open from Main with the pot total large, so that savings are the hero of that screen.
26. As a ребёнок, I want the active Цель card with name, cost, accumulated, remaining, and a date estimate that is «—» until the first deposit, so that Appendix A step 4's goal is now actionable.
27. As a ребёнок, I want to pick among the three preset Цели (Скейтборд, Телескоп, Велосипед) and switch the active one anytime, so that the dream I save toward is mine.
28. As a ребёнок, I want achieved Цели to stay visible but not selectable, so that I cannot reactivate a dream that already came true.
29. As a ребёнок, I want «Положить» to open a TransferIn sheet with a stepper capped at Баланс and a confirm, so that a deposit is an explicit choice.
30. As a ребёнок after a deposit, I want a FeedbackCard for Баланс −N and Копилка +N, so that the move is explained.
31. As a ребёнок, I want the date estimate to update after deposits, so that regular saving visibly shortens the wait.
32. As a ребёнок, I want «Забрать» to ask for an amount, then a WithdrawPreview showing the pot after and «мечта отодвинется на N дней», then a separate confirm, so that taking money out of Копилка is double-confirmed and shows the cost to the Цель.
33. As a ребёнок after a withdrawal, I want a FeedbackCard for Копилка −N and Баланс +N, so that the reversal is explained like every other movement.
34. As a ребёнок whose deposit reaches the active Цель's cost, I want a Celebration «Мечта сбылась!», the pot reduced by the cost, Настроение up, and a FeedbackCard, so that achievement is a moment, not a silent flag.
35. As a ребёнок after achievement, I want to pick a remaining Цель, so that Копилка still has somewhere to go.
36. As a ребёнок returning to Main after plan, purchase, or savings, I want badges, meters, Цель card, and the План tile to match the new state, so that the hub is the source of truth.
37. As a ребёнок, I want Прогресс to open a three-tab screen (Итоги | Журнал | Словарик) instead of Словарик alone, so that history lives with help.
38. As a ребёнок on Журнал, I want chronological movements grouped by Игровой день with kid labels (Пособие, Покупка: Обед, Перевод в копилку, …), so that every coin has a source.
39. As a ребёнок on Словарик inside Прогресс, I want the same ten terms and «Как играть» replay as today, so that help is not lost when Журнал arrives.
40. As a ребёнок on Итоги before any day has closed, I want a short explanation that Итоги appear after the first closed Игровой день, so that the tab is not empty and silent.
41. As a ребёнок on first open of an Игровой день when Пособие is credited, I want a FeedbackCard for +10 in addition to the existing ribbon, so that the recurring income has the same feedback as later movements.
42. As a ребёнок, I want Стартовый бюджет to stay the dedicated +100 explanation, so that the grant is not shown twice as a sheet.
43. As a ребёнок, I want Магазин and Копилка usable even before the План is confirmed, so that the hub nudge is not a hard gate (ending the day still requires a plan).
44. As a ребёнок, I want every user-facing string in Russian, short, and without shaming, so that the 7–11 register holds.
45. As a ребёнок, I want body text ≥16 sp, touch targets ≥48×48 dp, and status as icon + text (never color alone), so that economy screens stay readable.
46. As a ребёнок, I want the app to stay fully offline with no new permissions, so that the loop works in airplane mode.
47. As a ребёнок, I want visual response to taps within 1 s, so that steppers, confirms, and sheets feel immediate.
48. As a hackathon judge, I want Appendix A steps 5, 7–9 passable on a device, including an insufficient-funds Игрушка attempt with a way out, so that M3's acceptance criterion is demonstrable.
49. As a разработчик, I want screens to call the existing game-repository operations (save draft, confirm, purchase, transfer, withdraw, set active Цель) rather than a second economy path, so that M1 invariants stay the only write path.
50. As a разработчик, I want chrome strings in the centralized strings module using CONTEXT.md terms, so that synonyms like «кошелёк», «депозит», or «здоровье» never leak into the UI.
51. As a разработчик, I want catalog and goal numbers to keep coming from the versioned content files, so that prices and Цели stay data.
52. As an accessibility reviewer, I want tabs, steppers, item cards, and primary actions exposed as buttons with accessible names, so that tests and TalkBack share the same labels.

## Implementation Decisions

- **Reuse M1 writes; extend the existing SessionGame slice.** Real `createGameRepository` already implements `saveDraftPlan`, `confirmPlan`, `purchase`, `transferToSavings`, `withdrawFromSavings`, `setActiveGoal`, and `savingsState`. Do not add a parallel store or a UI-side money reducer. Extend the UI-facing `SessionGame` type (and the in-memory fakes) so jest-expo can drive the new screens. `createLiveSession` keeps passing the real repository through once the type is a subset of it.
- **Add read models on the same repository, not a new module.** Needed reads (chosen here because they do not exist today):
  - `dayState(profileId)` — open day's `dayId` / `n`, plan `status` (`none` | `draft` | `confirmed`), buckets (zeros when none), `available` (current Баланс), `actual` `{ mandatory, optional, savings }` from today's purchases and `savings_in` transfers.
  - `listJournal(profileId)` — transactions newest-first, with `dayN`, `amount`, `kind`, `labelKey`, `itemId`, `goalId`.
  - `listGoals(profileId)` — the three Цели with `key`, `cost`, `status`, `isActive`.
  - `purchasedItemIds(profileId, dayId)` — item ids bought today, for the «Куплено» badge (repurchase still allowed; the engine does not unique-constrain).
- **Confirming a План never moves Монеты.** The savings bucket is intent, not an automatic transfer. Actual Копилка changes only through «Положить» / «Забрать».
- **Магазин and Копилка are not gated on a confirmed План.** Main still highlights the План tile until confirm; «Закончить день» still demands a plan. Free play before confirm is allowed so the hub nudge is not a trap.
- **«Закончить день» still does not call `closeDay`.** After a confirmed plan it shows a next-step explanation that Итоги дня arrive in the next milestone. No stage recompute in M3.
- **FeedbackCard is a shared bottom-sheet component**, not per-screen copy. Zones: delta rows with icons (only the rows that moved: Баланс, Копилка, Забота, Настроение), cause line, next-step line, «Понятно». Kid copy for cause / next step lives in the strings module keyed by movement kind (`allowance`, `purchase`, `blocked`, `savings_in`, `savings_out`, `goal`). Do not add a new content JSON file in this milestone; catalog names still come from `catalog.json`.
- **UI builds the FeedbackCard payload from the known action plus the repository result** (item effect, transfer amount, `PurchaseResult.missing`, `achieved`). Do not change write signatures except where a read is added.
- **Пособие uses FeedbackCard when `openDay` reports `allowanceCredited`.** Keep the Main ribbon. Стартовый бюджет stays the dedicated grant screen — do not also sheet the +100.
- **Purchase flow:** catalog card → ItemSheet (description, «Купить» / «Отложить») → ConfirmSheet → `purchase` → FeedbackCard, or BlockedSheet if `status === "blocked"`. BlockedSheet options: wait for Пособие (stay, explain), go to Задания (existing stub), postpone (dismiss). No purchase row is written on block.
- **Withdrawal flow:** amount stepper → WithdrawPreview (pot after, days the Цель moves using the existing estimate helper against the post-withdraw remaining) → separate confirm → `withdrawFromSavings` → FeedbackCard. Insufficient pot uses the existing `ok: false` result and never credits.
- **Goal achievement:** `transferToSavings` returning `achieved: true` opens Celebration («Мечта сбылась!»), then FeedbackCard including Настроение +10 (`METERS.goalAchievedMoodBonus`). Pot reduction is already done in the repository. Prompt to pick another Цель when one remains.
- **Progress replaces the Glossary-only route.** Three tabs: Итоги (empty-state copy until a closed day exists — M3 does not close days, so this is always the empty state), Журнал, Словарик (move the current Glossary UI here; «Как играть» replay unchanged). Main's Прогресс tile opens Progress, defaulting to Журнал after the first visit is fine; first open may show Журнал.
- **Journal labels** (strings, CONTEXT.md terms): `starting_grant` → «Стартовый бюджет»; `allowance` → «Пособие»; `purchase:<id>` → «Покупка: {catalog name}»; `savings_in` → «Перевод в копилку»; `savings_out` → «Из копилки»; later kinds (`task_reward`, …) can wait for M4 with a safe fallback of the raw key only if they appear.
- **Chrome:** new screens use the existing kit (Screen, Card, PrimaryButton, TextButton, Chip, BackButton, Badge). Linear confirm/transfer sheets pin the primary in a Screen footer or sheet action row. Steppers are ± buttons ≥48 dp showing the integer value; never a free-text money field.
- **Navigation:** native stack already in place. Register Plan, Shop, Savings, Progress. Keep Stub for Задания and Взрослый раздел. Back from every new screen returns to Main. Item/confirm/blocked/feedback/celebration are presented as stack screens or in-screen sheets; they must not trap Back.
- **Hub refresh:** Main already reloads on focus via `openDay` / `getProfile` / `savingsState`. After M3 it must also read `dayState` so the План tile can switch from highlighted hint to «План готов».
- **Accessibility / UX minimum:** targets ≥48 dp, body ≥16 sp, tabs/status as icon+text, RU copy from CONTEXT.md. Animations toggle and the full UX checklist stay M6.
- **SessionGame shape to add** (decision-rich; names may match the repository 1:1):

```ts
type DayState = {
  dayId: string;
  n: number;
  plan: {
    status: "none" | "draft" | "confirmed";
    buckets: { mandatory: number; optional: number; savings: number };
  };
  available: number;
  actual: { mandatory: number; optional: number; savings: number };
};
```

## Testing Decisions

- **What makes a good test:** assert what a child can see and do — screens, copy, enabled/disabled controls, navigation, badge/meter/journal numbers — never styles, sheet animation, or provider internals. Prefer `getByRole` / accessible name, `userEvent`, async `render` + `screen` (RNTL v14). Query visible RU text; `testID` last. Do not re-test M1 invariants (balance == Σ transactions, over-balance rejected, pot ≥ 0, confirm locks) in UI tests; those stay in the data project's repository suite. If a UI test needs economy state, the fake repository records calls and returns a fixture. New repository reads (`dayState`, `listJournal`, …) get thin tests in the existing node suite: public read shape only.
- **Seams (fewest, highest, existing preferred):**
  1. **Navigation-root RNTL seam (primary, automated).** Render `FinPetApp` with fake game-repository and meta-repository adapters at the existing session-ports seam. Seed a returning child (`seedReturningChild`) and drive Appendix A 5, 7, 8, 9 with `userEvent`: confirm a План → buy at least one mandatory and one optional item → attempt Игрушка while short of 25 and assert BlockedSheet options (including a path to the Задания stub) → switch or keep a Цель and deposit → FeedbackCard after each movement → Журнал lists those rows → Main badges/meters/plan tile match. Cover draft remainder, confirm lock, postpone, and withdrawal preview + second confirm. One flow file is worth more than a file per screen.
  2. **Device acceptance seam (AC).** Appendix A 5, 7–9 on an Android device/emulator, including insufficient-funds Игрушка with a way out, and airplane mode. Step 6 (complete a Задание) stays a stub until M4; do not block M3 on it. This is the only place the milestone AC can be proven, matching M0/M2's device seam.
- **Prior art:** `src/ui/__tests__/firstRunFlow.test.tsx` (RNTL `await render` + `screen` + `userEvent` + fake ports). Extend that style in a sibling economy-flow test; keep first-run coverage intact. Fake ports must implement the new `SessionGame` methods with enough fidelity for those assertions (balance, meters, pot, plan lock, blocked purchase, journal rows).

## Out of Scope

- Completing a Задание / TaskRun / task reward FeedbackCard — M4 (Appendix A step 6). The Задания stub remains the way out from BlockedSheet.
- Итоги дня, `closeDay`, Этап recompute, «Следующий день», Демо-режим profile and ManualClock controls — M4. The Итоги tab is empty-state only.
- AdultGate, Взрослый раздел contents, reset/delete, kill-and-relaunch as a milestone AC — M5 (writes still go to SQLite immediately, as they already do).
- Accessibility hardening pass, permission audit, perf re-measure — M6.
- Родительский бонус, Помощник, unexpected medical event, landscape — stretch.
- Changing grant amounts, catalog prices, meter formulas, or schema shape.
- Retrofitting a FeedbackCard onto the Стартовый бюджет screen.

## Further Notes

- Milestone AC (ROADMAP §7 M3): steps 5–9 passable; a wrong-path purchase demonstrates the safe-error rule (no dead ends). Interpret step 6 as the existing Задания stub, not a blocker.
- M1 comment: goal-achievement Настроение bonus is +10 in `src/core/config.ts`; Celebration should show that number.
- Starting meters 50/50; a lunch purchase (+10 Забота) shows 60 on Main after return.
- Default active Цель remains Скейтборд (cost 90) until the child switches it.
- Vocabulary: План, Баланс, Монеты, Пособие, Обязательные расходы, Желаемые расходы, Копилка, Цель, Забота, Настроение, Журнал, Игровой день, FeedbackCard as the sheet (UI name can stay descriptive in code; user-facing button is «Понятно»). Avoid: кошелёк, депозит, вклад, мечта as the entity name (allowed in kid copy «мечта отодвинется» / «Мечта сбылась!» per ROADMAP), здоровье, счастье.
- Device Appendix A remains the same class of follow-up as M0/M2 when Android SDK is missing; do not skip the automated navigation-root tests.

## Comments
