# Shop-item Цели

Status: ready-for-agent

Grill locked 2026-09-20. Supersedes M1 story 13 (pot − cost + `status: achieved` on reach) and M3 Копилка stories 27–28, 34–35 (three preset chips, auto-debit, Настроение +10, force-pick next). `CONTEXT.md` already matches; do not revert it.

## Problem Statement

A ребёнок can only save toward three named presets that are not in Магазин. Reaching the cost silently spends the Копилка and never buys anything. They cannot point at a real Желаемое, buy it with the saved coins, or set a Цель from the shelf they already browse.

## Solution

Every Цель is one Желаемое from Магазин (at most one at a time). Скейтборд, Телескоп, and Велосипед join that shelf as one-shot rows; candy-tier stays rebuyable and may still be a Цель. Копилка stays one pot. When the pot reaches the price, coins stay; Celebration offers «Купить из копилки» or «Позже». Настроение moves only when the item is actually bought. After that buy, a button opens the shared «Выбери цель» picker.

## User Stories

1. As a ребёнок on Копилка, I want the active Цель to be a Магазин Желаемое (name, price, accumulated/price, remaining), so that I am saving for something I can actually buy.
2. As a ребёнок on Main, I want the Цель card to show that same item, so that the hub matches Копилка.
3. As a ребёнок, I want at most one Цель at a time, so that the pot has a single dream.
4. As a ребёнок, I do not want an Обязательное (Обед, Проезд, …) to be a Цель, so that today’s care is not postponed as a dream.
5. As a ребёнок, I want Конфета, Стикеры, Кино, and Игрушка to be valid Цели, so that a short save is still a real shelf item.
6. As a ребёнок, I want Скейтборд (90), Телескоп (160), and Велосипед (240) on the Желаемое tab, so that the old dreams are things I can buy.
7. As a ребёнок looking at those three, I want the label «Можно купить один раз», so that I know they leave the shelf after a purchase.
8. As a ребёнок who already bought Скейтборд (from Баланс or Копилка), I do not want it on Магазин or in the picker, so that I cannot buy it again.
9. As a ребёнок who reached Скейтборд but did not buy it, I still want it as a Цель and on the shelf, so that «хватило» is not ownership.
10. As a returning ребёнок on Первый запуск, I want Скейтборд seeded as the first Цель, so that Main is not empty of a dream.
11. As a ребёнок, I want one «Выбери цель» picker listing every Желаемое I may still set (not owned one-shots), so that Копилка and Магазин do not invent two choosers.
12. As a ребёнок on Копилка with no Цель, I want that picker so that I can start saving.
13. As a ребёнок on a Желаемое sheet, I want «Сделать целью», so that I can pick a dream without leaving Магазин.
14. As a ребёнок who already has another Цель, I want confirm-replace («Цель станет {name}. В копилке останется {pot}.») before the switch, so that moving the same coins is a real choice.
15. As a ребёнок, I want a way to drop the current Цель without picking another, so that I can have none.
16. As a ребёнок who drops a Цель, I want the pot unchanged, so that drop is not «Забрать».
17. As a ребёнок, I want «Положить» to still debit Баланс and grow the pot, so that saving is the same gesture.
18. As a ребёнок, I want the date estimate to stay «—» until the first deposit of this profile, so that empty saving is not a fake date.
19. As a ребёнок whose deposit makes pot ≥ the Цель price, I want Celebration «Мечта сбылась!» with «Купить из копилки» and «Позже», so that I see I have enough without losing the coins.
20. As a ребёнок on that Celebration, I do not want Настроение to change, so that reaching is not a second jackpot.
21. As a ребёнок on that Celebration, I do not want «Выбери новую цель», so that this dream is not replaced before I buy or drop it.
22. As a ребёнок who taps «Позже», I want the Цель to stay funded (pot still there, remaining 0), so that I can buy later.
23. As a ребёнок who withdraws below the price after Celebration, I do not want the modal again when I climb back on this same Цель, so that dipping one coin is not a loop.
24. As a ребёнок who confirm-switches onto a cheaper Желаемое the pot already covers, I want the buy offer (Celebration or sheet CTA) without a new Настроение, so that “you already have enough” is true and not a farm.
25. As a ребёнок with pot ≥ price, I want «Купить из копилки» on Копилка and on that item’s Магазин sheet, so that «Позже» is not a one-frame trick.
26. As a ребёнок who cannot cover the full price from the pot, I do not want a partial Копилка pay mixed with Баланс, so that «из копилки» always means the whole tag.
27. As a ребёнок who buys the Цель from Копилка, I want the pot reduced by the price, surplus left in Копилка, Баланс unchanged, so that only the saved pile pays.
28. As a ребёнок after that buy, I want a real purchase: Журнал «Покупка: {name}», the item’s meter delta, «Куплено» semantics, so that it is not a hidden «Забрать».
29. As a ребёнок after that buy, I do not want today’s План желаемое leftover or the day-close overspend −5 to include that price, so that cashing in last week’s save is not “overspend today.”
30. As a ребёнок after that buy, I do not want a second Журнал «Из копилки» for the same action, so that it does not look like I withdrew to Баланс.
31. As a ребёнок after a successful Цель-buy (Копилка or Баланс), I want FeedbackCard then a button «Выбрать новую цель» that opens the same picker, so that the next dream has a door.
32. As a ребёнок who tapped «Позже» or who dropped the Цель, I do not want that picker forced, so that empty-Цель is allowed.
33. As a ребёнок buying the current Цель from Баланс, I want the sheet to warn that this clears the Цель and leaves the pot, so that impulse spend is honest.
34. As a ребёнок who confirms that Баланс buy, I want the item purchased from Баланс, the Цель cleared, Копилка unchanged, so that Q4 stays spend-now.
35. As a ребёнок with enough Баланс and no Цель, I want to buy Скейтборд from Магазин anyway, so that Три решения still include spending now.
36. As a ребёнок who impulse-bought a one-shot that was not the Цель, I want it gone from the shelf, and I do not want «Целей: N» to increment, so that N means “bought the dream,” not “I own.”
37. As a ребёнок who bought Конфета while it was the Цель (either pocket), I want N to increment, so that short dreams still count.
38. As a ребёнок who bought Конфета as a normal Желаемое (not the Цель), I do not want N to increment, so that everyday candy is not a trophy.
39. As a ребёнок after buying Конфета as the Цель, I want to set Конфета as a Цель again, so that rebuyable items stay practice.
40. As a ребёнок after buying Скейтборд, I do not want to set it as a Цель again, so that one-shot means one-shot.
41. As a ребёнок who cannot afford a Желаемое, I want BlockedSheet’s old «Отложить» to be «Сделать целью» (confirm-switch if needed), so that postpone is the dream path.
42. As a ребёнок on that BlockedSheet when the item already is the Цель, I want copy that points at Копилка, not another «Сделать целью», so that I am not looping.
43. As a ребёнок who cannot afford an Обязательное, I still want «Отложить» as dismiss, so that lunch is not a Цель.
44. As a ребёнок, I want «Забрать» to keep the preview (pot after, days the Цель moves) and the second confirm, so that taking from the pot still shows the cost to the dream.
45. As a ребёнок with no Цель, I want «Забрать» still possible, so that coins in Копилка are never trapped.
46. As a ребёнок after a Копилка-paid buy, I want Main’s Цель card empty or prompting a pick, meters matching the item effect, Баланс unchanged, pot the surplus, so that the hub is the source of truth.
47. As a ребёнок on Прогресс, I want «Целей: N» to equal how many times I bought while that item was the active Цель, so that the count matches the grill.
48. As a ребёнок, I do not want a bought bike to change Вид / Окрас / Аксессуар, so that appearance stays the designer three-by-three.
49. As a ребёнок, I want Словарик Настроение to say it grows from Желаемые, not from “цель достигнута,” so that help matches the game.
50. As a ребёнок, I want Словарик Цель / Копилка / Желаемые to match CONTEXT.md (one shop dream; coins leave by «Забрать» or buying the Цель; some Желаемые once), so that help is not the old presets.
51. As a разработчик, I want REQUIREMENTS / ROADMAP Копилка–Магазин–goals content updated, so that agents do not restore three presets, auto-debit, or +10 mood on reach.
52. As a разработчик, I want Магазин and Копилка to keep calling the game-repository (no UI money reducer), so that M1 invariants stay the only write path.
53. As a хакатон judge, I want Appendix A plan / shop / savings still playable, including insufficient-funds Игрушка with a way out that can now be «Сделать целью».
54. As a TalkBack user, I want picker rows, «Сделать целью», «Купить из копилки», and drop exposed as named buttons, so that tests and TalkBack share labels.
55. As a ребёнок, I want the app to stay fully offline with no OS notification permission, so that «уведомить» stays the in-app Celebration.
56. As a ребёнок in Демо-режим, I want the same Цель rules on the demo profile, so that judges are not on a second economy.

## Implementation Decisions

- **Catalog is the only Цель source.** Fold Скейтборд / Телескоп / Велосипед into the Желаемые catalog at prices 90 / 160 / 240. Retire the parallel goals content list as a source of truth. Optional catalog flag `once` (true only on those three). Meter effects on buy: Скейтборд +12 Настроение, Телескоп +15, Велосипед +18 (ordinary shelf deltas, not a reach bonus). Candy-tier unchanged and `once: false`.
- **At most one active Цель**, stored as a catalog id (or null). First-run / demo still seed `skateboard`. `setActiveGoal` accepts a non-owned optional id; `clearActiveGoal` sets null and does not move coins. Switching is an overwrite after the UI confirm.
- **Ownership of `once` items** is “a purchase row exists for that id,” any payment pocket. It is not the old goals `status: achieved`. Reaching the price does not own anything.
- **Deposit does not spend the pot.** `transferToSavings` still debits Баланс and writes `savings_in`. If pot ≥ active price it returns a funded flag for Celebration. It must not write `savings_out` of the cost, must not apply `goalAchievedMoodBonus`, must not clear the Цель. Stop using that mood constant.
- **Funded** means pot ≥ price. Remaining is 0. Core progress helper must not subtract cost from the pot (today it returns `potAfter = pot - cost` on reach — that model is gone). Surplus deposits stay.
- **Celebration once per stint.** Persist that this active Цель already showed the funded modal. Withdraw below the price does not clear that bit. Drop or set a different id starts a new stint (buy CTA may appear immediately if still covered; no mood either way).
- **Buy from Копилка** is a new repository intent, not withdraw-then-`purchase`. Preconditions: active Цель is this item, pot ≥ price. Effects: pot − price via savings `out`; purchase row for the item; item meter; clear Цель; stamp this purchase as “bought as active Цель”; Баланс unchanged. Журнал shows one «Покупка: {name}» and must not also show «Из копилки». Do not credit Баланс (unlike «Забрать»). Keep `balance == Σ` of balance-moving transactions: this buy is not a Баланс movement.
- **Баланс `purchase`** stays as today. If the item is the active Цель, also clear the Цель and stamp “bought as active Цель.” If it is `once`, it leaves the catalog views. Pot unchanged.
- **План actuals and day close:** `actual.optional`, optional overspend, and within-plan spend ignore Копилка-paid purchases. `actual.savings` is still today’s `savings_in` only. Копилка-paid buys still exist as purchases for Журнал, meters, Куплено, and `once` ownership.
- **«Целей: N»** counts purchases stamped bought-as-active-Цель (candy included). Impulse one-shot with no active Цель does not increment N.
- **Picker** is one overlay/sheet used from Копилка, Магазин «Сделать целью», BlockedSheet, and the post-buy «Выбрать новую цель» button. Rows: optional items not owned-`once`. Current Цель marked. Drop control lives with it (and/or Копилка) so a child can have none.
- **Магазин sheet** for a settable Желаемое: «Сделать целью»; if this is the Цель and pot ≥ price, «Купить из копилки»; «Купить» from Баланс with the Q4 warning when it is the Цель. Owned `once` rows are omitted from the tab, not greyed as repurchase.
- **BlockedSheet** for optional unaffordable: replace «Отложить» with «Сделать целью» (same confirm-switch). If it already is the Цель, dismiss-and-point-at-Копилка copy instead of a second set. Mandatory BlockedSheet keeps «Отложить» as dismiss. Keep «дождаться Пособия» and «выполнить Задание».
- **Копилка UI:** keep pot hero, «Положить» / «Забрать» double-confirm. Replace the three preset chips with the active card + picker entry. Celebration actions are Купить из копилки / Позже, then FeedbackCard on buy only (item meter, Копилка delta). After buy, «Выбрать новую цель». Do not prompt the picker after Позже or drop.
- **Migration:** one schema/content step so existing profiles do not keep three ghost presets. Old `status: achieved` without a purchase is not ownership (they never received the item). Do not refund coins already auto-debited under the old rule.
- **Docs:** REQUIREMENTS / ROADMAP Магазин catalog (8 → 11 items, `once`), Копилка (no auto-debit, no +10 on reach, buy from pot), retire goals-as-separate-presets. `terms.json` Настроение / Цель / Копилка / Желаемые aligned with CONTEXT.md. «Как играть» bodies can stay; do not add a tour beat unless a sentence becomes false.
- **No ADR.** The grill trade-offs (one Цель, coins stay, no reach mood) live in this spec; they supersede M1/M3 comments rather than a new architecture record.
- **No mixed tender, no pet mesh, no OS push, no new glossary word** for one-shot (the shelf label is enough).

## Testing Decisions

- A good test asserts what the ребёнок can see and what the ledger did: which item is the Цель, pot vs Баланс, Celebration actions, whether Настроение moved, Журнал label, План leftover, shelf presence, «Целей: N». It does not assert confetti, sheet animation, or exact chip layout.
- **Two existing seams, no third flow file:**
  1. **Repository node suite (engine).** Public operations only: deposit funds without shrinking the pot or moving mood; withdraw below price; `once` blocked after any purchase; buy-from-Копилка leaves Баланс still, pot − price, purchase + meter, clears Цель; Баланс buy of the Цель clears Цель and leaves pot; `actual.optional` / closeDay overspend ignore Копилка-paid optional; N-stamp only when the item was active; `setActiveGoal` rejects owned `once` and mandatory ids; `clearActiveGoal` keeps pot.
  2. **Navigation-root RNTL (`savingsFlow` + `shopFlow`).** Same `FinPetApp` + fake ports as today. Extend those files: Celebration Купить/Позже and no «Настроение +10»; buy from pot on Копилка and on the Магазин sheet; «Сделать целью» + confirm-switch; BlockedSheet «Сделать целью» on Игрушка; one-shot labelled and gone after buy; post-buy «Выбрать новую цель» opens the picker; impulse Скейтборд does not bump N; Конфета-as-Цель buy does. Query roles/names and visible RU text (RNTL v14 `screen`, `userEvent`).
- **Sister flows** (`firstRunFlow`, `economyFlow`, `progressFlow`, fake ports, createProfile seeds) only change where they assume three `goals.json` chips, auto-debit on `achieved: true`, or BlockedSheet «Отложить» on a Желаемое. Do not add a chrome or day-close suite for this feature.
- Fake `SessionGame` must grow the new intents (clear Цель, buy from Копилка, funded-without-spend deposit) with enough fidelity for those assertions. Do not re-test balance-Σ invariants in UI tests.
- Independent literals: Скейтборд 90 still default; «Мечта сбылась!»; «Купить из копилки»; «Позже»; «Можно купить один раз»; «Целей:»; no `Настроение +10` on the funded deposit.

## Out of Scope

- Multiple simultaneous Цели or per-Цель earmarked piles.
- OS / push notifications.
- Showing a bought bike on the Питомец (new Аксессуар art).
- Mixed Баланс+Копилка payment for one item.
- Changing Пособие, Стартовый бюджет, План steppers, or Обязательные catalog.
- New Словарик term «Большая покупка».
- Rewriting «Как играть» beats unless a current sentence is false.
- Adult-section / demo-clock / day-unlock changes.

## Further Notes

- Kid copy may still say «мечта» on Celebration («Мечта сбылась!», withdraw preview). Entity name stays Цель.
- `withinPlan` today sums every purchase price against mandatory+optional buckets; Копилка-paid optionals must be excluded there too, not only the overspend helper.
- Play-status-strip keeps the Main Цель card; this spec fills that card from a catalog Желаемое instead of a preset.
