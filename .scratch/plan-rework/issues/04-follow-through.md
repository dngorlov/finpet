# 04: Leftover on Магазин and Копилка

**What to build:** After a confirmed План, one leftover line under Магазин tabs (active tab’s bucket) and on Копилка home. Buy and Положить confirms show leftover after this tap and a soft warn if over. Unconfirmed: no leftover chrome. Extend `economyFlow`.

**Blocked by:** 01

**Type:** task

**Status:** resolved

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

## Answer

After a confirmed План, leftover is `plan − actual` for that bucket. Магазин shows one line under the tabs for the open tab (`«Осталось N»` / `«сверх плана N»`, a11y includes Обязательные / Желаемые). Buy confirm adds `«в плане останется N»` and `«Это сверх плана.»` when N < 0 without disabling Купить. Копилка home shows the savings leftover; Положить confirm uses the same after-tap lines; Забрать does not. Unconfirmed days omit leftover. Main and StatusStrip are unchanged. `economyFlow` after `confirmTinyPlan` sees leftover `«Осталось 1»`, still buys Обед with the warn, shows Копилка leftover, and keeps Баланс 110 until the shop.

`npm test -- src/ui/__tests__/economyFlow.test.tsx`: 2 passed, 2 total. `npm run typecheck`: pass.
