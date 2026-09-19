# 03: Buy from Магазин

**What to build:** A child can open Магазин from Main, browse eight items in Обязательное / Желаемое tabs, inspect an item (price, pet impact, description), confirm a purchase they can afford, and hit a BlockedSheet when they cannot (Игрушка at 25 is the staging case). A successful buy shows FeedbackCard and updates Main. A blocked buy never debits and always offers a way out.

**Blocked by:** 02

**Status:** resolved

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (Магазин / BlockedSheet / purchase flow)
- Catalog content: existing `catalog.json` (8 items)
- Writes: existing `purchase`; reads: `purchasedItemIds`, `dayState`
- FeedbackCard from ticket 02

## Must

- Replace the Магазин stub with Catalog + ItemSheet + Confirm + BlockedSheet, kit chrome, tabs «Обязательное» / «Желаемое».
- Item cards: name, price, impact preview, «после покупки: N монет». Today’s buys show «Куплено»; repurchase still allowed.
- Affordable confirm calls `purchase` then FeedbackCard (Баланс and the item’s meter).
- Insufficient funds: BlockedSheet «Не хватает N монет», options дождаться Пособия / выполнить Задание (existing stub) / отложить. No write on block.
- Cover at the navigation-root seam: buy Обед (or another mandatory) and one optional; attempt Игрушка while short and assert the three ways out. Do not re-test M1 debit invariants.

## Done when

Appendix A step 7 is playable in the UI test (minus needing a prior plan). `npm test` and `npm run typecheck` pass.

## Answer

Магазин has Обязательное / Желаемое tabs, item sheet, confirm, FeedbackCard, «Куплено», and BlockedSheet with wait / задание / postpone. Main opens Shop. Hub meters and Баланс update after a buy.
