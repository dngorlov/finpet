# 04: Leftover on Магазин and Копилка

**What to build:** After a confirmed План, one leftover line under Магазин tabs (active tab’s bucket) and on Копилка home. Buy and Положить confirms show leftover after this tap and a soft warn if over. Unconfirmed: no leftover chrome. Extend `economyFlow`.

**Blocked by:** 01

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/plan-rework/spec.md` (stories 20–30, 41–42; leftover math; Testing Decisions: economyFlow literals)
- Map: `.scratch/plan-rework/map.md`
- Prior art: `src/ui/screens/ShopScreen.tsx`, `src/ui/screens/SavingsScreen.tsx`, `src/ui/__tests__/economyFlow.test.tsx`, `confirmTinyPlan`

## Must

- Leftover = plan − actual for that bucket. Visible «Осталось N» or «сверх плана N». Accessible name includes the bucket label.
- Магазин: one line under the tabs, switches with Обязательное / Желаемое. Not on item cards. Buy confirm: «в плане останется N» (N may be negative) + «Это сверх плана.» when after-tap leftover < 0. Do not disable Купить for that. BlockedSheet unchanged.
- Копилка home: savings leftover when confirmed. Положить confirm same after-tap lines. Забрать confirm has no plan leftover. Deposit stepper still has no track.
- Unconfirmed / draft / none: omit leftover. Main and status strip untouched.
- `economyFlow`: leftover «Осталось 1» on mandatory tab after tiny plan; buy Обед still works with warn «Это сверх плана.»; Копилка home leftover; confirm still does not change Баланс before shop.

## Done when

`npm test -- src/ui/__tests__/economyFlow.test.tsx` and `npm run typecheck` pass.
