# План: promise you can follow

Status: ready-for-agent

## Problem Statement

План is a spreadsheet of three +1 steppers. A ребёнок with Баланс 110 must tap dozens of times to name a real split, the screen never says that confirm is a promise (coins stay in Баланс), and after «План готов» the numbers vanish from Магазин and Копилка. The child cannot follow what they promised, and «Как играть» only names the three rows.

## Solution

Keep the three amount buckets and the lock-after-confirm economy. On the draft, each row is a number plus a drag track and −/+ (hold repeats). Kid copy states the promise; the Копилка row reminds that Положить is separate. Yesterday’s actuals are a draft-only hint («вчера N»), hidden on the first Игровой день. After confirm, Магазин (active tab) and Копилка home show leftover for that bucket; buy / Положить confirm shows leftover after this tap and warns if it would go past the План, without blocking. Словарик gains План. The status strip and Main stay as they are («План готов», no plan numbers in chrome).

## User Stories

1. As a ребёнок on a draft План, I want one sentence that this is today’s promise and that coins stay in Баланс, so that confirm does not feel like a purchase.
2. As a ребёнок on the Копилка row of that draft, I want a short extra that I will put those coins in later on Копилка, so that planning 20 is not confused with Положить.
3. As a ребёнок tapping «Подтвердить план», I want the sheet to repeat that this is a promise (Магазин and Копилка still move coins) and that the План then cannot change, so that I am not told coins «пойдут» now.
4. As a ребёнок, I want confirming a valid План still not to move Баланс, so that Магазин and Копилка remain the only spends.
5. As a ребёнок, I still want three named amount rows — Обязательные, Желаемые, Копилка — so that I practice splitting the day, not making a shopping list.
6. As a ребёнок, I want each draft row to show the current integer, so that I can read the promise I am typing.
7. As a ребёнок, I want a horizontal track on each draft row that I can drag to any integer from 0 through today’s available amount, so that I am not tapping + forty-five times.
8. As a ребёнок, I want − and + still at the ends of that row, so that I can nudge without dragging.
9. As a ребёнок who holds − or +, I want the value to keep stepping by 1 until I release, so that TalkBack and long presses are not one-coin chores.
10. As a ребёнок, I want a single tap of + or − to change that row by 1, so that 7, 8, and 12 stay reachable.
11. As a ребёнок whose three rows sum past available, I still want the remainder line and the over-budget sentence, and «Подтвердить план» disabled, so that I cannot promise coins I do not have.
12. As a ребёнок on a draft, I still want «Останется свободных: N» (N may be negative), so that leftover of the split stays visible.
13. As a ребёнок on the first Игровой день, I do not want a yesterday line, so that Appendix A’s first План has no ghost history.
14. As a ребёнок on a later day’s draft, I want each row to show «вчера N» from the last closed day’s actual for that bucket, so that I can split today with yesterday in view.
15. As a ребёнок whose last closed Копилка actual is deposits in, I want that number as «вчера N» on the Копилка row, so that withdrawals are not painted as yesterday’s spend.
16. As a ребёнок who moved 0 in a bucket yesterday, I want «вчера 0» on that row, so that empty is not hidden as missing.
17. As a ребёнок, I do not want yesterday’s numbers copied into today’s draft, so that a smaller Баланс is not pre-over-budget.
18. As a ребёнок after confirm, I do not want «вчера N» on the locked План, so that the screen is only today’s план · потрачено.
19. As a ребёнок on a confirmed План, I still want план / потрачено per bucket and no −/+, so that the promise is locked for the Игровой день.
20. As a ребёнок whose План is not confirmed, I do not want leftover chrome on Магазин or Копилка, so that unpromised days are not fake envelopes.
21. As a ребёнок with a confirmed План on Магазин’s Обязательное tab, I want one leftover line for Обязательные under the tabs, so that I can follow that promise while I shop needs.
22. As a ребёнок on Магазин’s Желаемое tab, I want that leftover line to switch to Желаемые, so that the optional promise is the one I see with candy and cinema.
23. As a ребёнок on Копилка home with a confirmed План, I want one leftover line for the Копилка bucket, so that I can see how much I still meant to put in.
24. As a ребёнок, I want leftover shown as «Осталось N» when plan − actual ≥ 0, so that one number is the follow cue.
25. As a ребёнок who already passed a bucket, I want that line to read «сверх плана N» (N = how far over), so that I see the break without a negative leftover.
26. As a ребёнок on a buy confirm with a confirmed План, I want «в плане останется N» for that item’s bucket after this price, so that the last tap shows the follow-through.
27. As a ребёнок on Положить confirm with a confirmed План, I want «в плане останется N» for Копилка after this deposit, so that saving has the same last-chance number.
28. As a ребёнок whose buy or deposit would make leftover after the tap < 0, I want an extra line «Это сверх плана.», so that I am warned before I break the promise.
29. As a ребёнок on that warn, I still want to confirm if Баланс allows it, so that the План stays a promise and not a reservation.
30. As a ребёнок who cannot afford the item, I still want the existing insufficient-funds sheet and no leftover math as a second block, so that Баланс remains the only hard gate.
31. As a ребёнок on Main after confirm, I still want the План tile to say «План готов» and not the three leftovers, so that the hub does not grow a second spreadsheet.
32. As a ребёнок, I do not want plan leftovers on the status strip, so that Забота, Настроение, Баланс, Этап, and Настройки stay the locked chrome.
33. As a ребёнок on Итоги дня or Прогресс Итоги, I still want the existing plan-vs-actual, so that this pass does not restyle day-close.
34. As a ребёнок in Словарик, I want an 11th term План with the kid definition that confirm does not spend, so that the loop’s name is explained in help.
35. As a ребёнок on «Как играть» at the buckets beat, I want the tooltip «Раздели монеты на три кучки. Это обещание, не покупка.», so that the tour states the job.
36. As a ребёнок on the hub План beat, I still want «Сначала составь план дня.», so that the first spotlight stays the same short nudge.
37. As a ребёнок in «Как играть», I do not want the tooltip to mention yesterday, so that the first-run tour does not lie.
38. As a TalkBack user on a draft row, I want the value named «Обязательные 12» (or Желаемые / Копилка and the current N), so that the track is not a second unnamed control.
39. As a TalkBack user, I want − / + still named «Обязательные, меньше / больше» (and the same pattern for the other rows), so that hold-repeat does not change the seam.
40. As a TalkBack user, I want «вчера N» spoken as that visible text, not as a second button, so that yesterday is a hint.
41. As a TalkBack user, I want leftover named with the bucket, e.g. «Обязательные: осталось 1» or «Обязательные: сверх плана 11», so that the tab’s leftover is not a bare «Осталось 1».
42. As a TalkBack user on buy/Положить confirm, I want «в плане останется N» and, when over, «Это сверх плана.» as text, so that the warn is spoken.
43. As a ребёнок on Копилка Положить / Забрать, I still want the existing amount stepper without a track, so that this rework does not change deposit UX.
44. As a ребёнок during «Как играть» on План, I still want «Подтвердить план» not to lock, and draft writes not to persist, so that practice stays dry.
45. As a разработчик, I want REQUIREMENTS §5 and ROADMAP §4.2 Plan to describe the track + promise copy + leftover follow-through, not «steppers only», so that docs do not restore +1-only rows.
46. As a разработчик, I want ROADMAP / REQUIREMENTS Словарик counts to say 11 terms including План, so that agents do not trim the new entry.
47. As a разработчик, I want CONTEXT.md’s План term left as the promise (not a transfer), so that it is not reverted.
48. As a хакатон judge, I want Appendix A still playable: first План, Магазин, Копилка, day close, so that leftover chrome does not trap the script.

## Implementation Decisions

- No schema, no scoring change, no shop/savings gate on the План. Confirm still does not move Монеты. «По плану» remains total shop spend ≤ mandatory + optional. Optional overspend still only penalizes Настроение at day close. Leftover on Магазин is stricter than that score and is a hint, not a rule engine.
- Draft copy (locked): under the available line, «Это обещание на сегодня. Монеты пока в Балансе.» Under the Копилка row only: «Положишь их отдельно — в Копилке.» Confirm title stays «Подтвердить план дня?». Confirm body: «Это обещание. Монеты останутся в Балансе, пока ты не купишь в Магазине или не положишь в Копилку. Потом план не меняется.»
- Draft control: keep three labelled rows. Add a horizontal integer track 0…today’s `available` (not remainder). −/+ stay; tap = ±1; press-and-hold repeats ±1. Do not reuse the FirstRun bead slider (that is discrete stops). Do not put the track on Копилка deposit/withdraw. Over-budget stays total vs available; a row may sit at available while the three sum too high.
- Yesterday: only on draft, only when `lastClosedDay` exists. Text «вчера N» per row from that summary’s `actual` (purchases for Обязательные / Желаемые, `savings_in` for Копилка). Show «вчера 0». Never prefill buckets. After confirm, drop yesterday; locked view stays план · потрачено for today. First Игровой день and any profile with no closed day: no yesterday line.
- Follow-through leftover = bucket plan − bucket actual. Visible list/home: «Осталось N» if ≥ 0, else «сверх плана N» with N the absolute overshoot. One line under Магазин tabs for the **open** tab’s bucket; one line on Копилка home for savings. Not on item cards, not on Main, not on the strip, not on Итоги дня / Прогресс. Unconfirmed or plan status none/draft: omit the line.
- Buy confirm (confirmed План, matching item kind) and Положить confirm (confirmed План): always «в плане останется N» using leftover **after** this amount (N may be negative, same honesty as the remainder line). If that after-value is < 0, also show «Это сверх плана.» Do not disable Купить / Положить for that reason. Insufficient Баланс / pot stays the existing hard block and does not grow a leftover block. Забрать confirm does not show plan leftover (withdrawals are not that actual).
- TalkBack: row value remains `bucketValue` (e.g. «Обязательные 12»); −/+ names unchanged; track has no accessible name. Yesterday is visible text only. Leftover accessible name includes the bucket («Обязательные: осталось 1» / «Желаемые: сверх плана 5» / «Копилка: осталось 0»). Confirm leftover and warn are visible text. Do not add an `adjustable` role this pass.
- Словарик: add term id `plan`, term «План», definition «Обещание, как разделить сегодняшние монеты: обязательное, желаемое и копилка. Подтвердить план монеты не тратит.» Place it after Пособие in the list. Content schema length 10 → 11. Keep `contentVersion` 1. «Как играть» `plan-buckets` body: «Раздели монеты на три кучки. Это обещание, не покупка.» Hub `main-plan` body unchanged. Overlay still renders `body` only.
- Reads: draft План already has `dayState`; also read existing `lastClosedDay` for yesterday. Магазин and Копилка already touch `dayState` / profile; they must use plan status, buckets, and actual for leftover. No new repository method.
- Docs: REQUIREMENTS §5 (steppers → track + live leftover on Магазин/Копилка after confirm). REQUIREMENTS §11 term count 10 → 11 including План. ROADMAP §2.5 / §4.2 Plan / §4.2 Progress Словарик / §5.2 terms count. Do not revert CONTEXT.md. Append a supersession note on any chrome-kit / M3 story that required План as +1-only steppers with no promise copy. No ADR.

## Testing Decisions

- A good test asserts what the ребёнок can see and do: promise sentences, confirm body, ± still change N and remainder, over-budget still blocks, no «вчера» on the first day, «вчера N» on the next day’s draft after a close, leftover on Магазин/Копилка only after confirm, warn without blocking a buy that overruns the bucket, Словарик lists План, tour tooltip uses the new buckets body, Баланс unchanged at confirm. It does not assert track length, thumb size, hold-repeat interval, pan math, or leftover color.
- One behavior seam: navigation-root RNTL with fake `SessionPorts` (same as today). Do not add a new plan-rework test file. Extend `planFlow` (draft copy, ±, over-budget, lock, no yesterday on a returning child with no closed day), `economyFlow` (leftover under shop tabs and on Копилка; buy confirm «в плане останется»; overrun warn still purchases), `firstRunFlow` (buckets tooltip from content; first-day План has no «вчера»; Словарик shows 11 terms including План), `dayCloseDemoFlow` (after «Следующий день», draft План shows «вчера» from the closed actuals). Content loader node test: terms list includes План and has length 11; `plan-buckets` body is the new sentence.
- RNTL v14: async `render`, `screen`, `userEvent`, role/name. Drive amounts with existing `getByRole("button", { name: "Обязательные, больше" })` (and sisters); do not drag the track in tests. Independent literals: «Это обещание на сегодня. Монеты пока в Балансе.», «Положишь их отдельно — в Копилке.», confirm body as locked, «вчера 0» (or the actual N after a known close), «Осталось 1» after `confirmTinyPlan` on the matching shop tab, «Это сверх плана.» when buying Обед (12) against a tiny mandatory 1, `getByLabelText("Обязательные: сверх плана 11")` after that buy if the label is the leftover. Баланс 110 after confirm still via the strip name.
- Sister flows keep testing economy; update only queries that break because leftover / promise lines appeared or because Словарик is 11 terms. `confirmTinyPlan` stays ±1 on three rows. Do not assert hold-to-repeat.

## Out of Scope

- Reserving or auto-transferring coins at confirm; gating Магазин or Копилка on leftover or on a confirmed План.
- Prefill from yesterday, stacked split-bar, item-checklist planning, or putting leftovers on Main / the status strip.
- Changing AmountStepper on Положить / Забрать (no track there).
- Changing Итоги дня, Прогресс Итоги, day score, meter penalties, catalog prices, or «Как играть» beat order.
- New pictogram art, animation, or an `adjustable` slider role.
- ADR. FirstRun, TaskRun, adult chrome.

## Further Notes

- Grill locked 2026-09-20: План is a promise (Q1.1); numeric amounts (Q2.1) plus yesterday as show-only; yesterday hint not prefill, hide first day (Q3.1); track + number + hold-repeat ± (Q4.1); promise line + Копилка extra (Q5.1); Словарик 11th term (Q6.1); «вчера N» on all three (Q7.1); track on План only (Q8.1); yesterday draft-only (Q9.1); copy pack accepted (Q10); leftover at Магазин/Копилка not Main/strip (Q11.1); soft warn (Q12.1); «Осталось N» on list plus confirm after-tap (Q13.1); TalkBack pack (Q14).
- Placement locked with the user: one leftover line under Магазин tabs (active tab) and one on Копилка home, not per item card.
- CONTEXT.md already defines План as a promise, not a coin movement. Do not revert it.
- `terms.json` validation currently requires exactly 10 entries; this spec changes that count to 11.
