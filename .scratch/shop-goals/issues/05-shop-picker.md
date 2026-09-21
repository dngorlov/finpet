# 05: Магазин sheet, BlockedSheet, shared picker

**What to build:** One «Выбери цель» picker; Магазин can set a Цель, buy it from Копилка when funded, warn on Баланс buy of the current Цель; BlockedSheet postpone is «Сделать целью» for Желаемые. One-shot rows labelled and omitted once owned.

**Blocked by:** 03

**Type:** task

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (stories 4–9, 11–16, 24–25, 33–43, 54; picker / sheet / BlockedSheet decisions)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `src/ui/screens/ShopScreen.tsx`, `src/ui/__tests__/shopFlow.test.tsx`, `src/ui/screens/MainScreen.tsx`

## Must

- Shared picker overlay: optional items not owned-`once`; current marked; drop allowed. Opened from Копилка, «Сделать целью», BlockedSheet, post-buy «Выбрать новую цель». Confirm-replace copy when another Цель is active: «Цель станет {name}. В копилке останется {pot}.»
- Желаемое sheet: «Сделать целью»; if this is the Цель and pot ≥ price, «Купить из копилки»; Баланс «Купить» warns and clears Цель, pot stays. Mandatory sheet unchanged.
- Owned `once` omitted from Желаемое tab (not a grey repurchase). Label «Можно купить один раз» on those three while still on the shelf. Impulse Скейтборд with no Цель is allowed.
- BlockedSheet optional: «Отложить» → «Сделать целью» (same confirm-switch). If it already is the Цель, point at Копилка. Mandatory keeps «Отложить». Keep wait-Пособие and Задание.
- Main Цель card reads catalog Желаемое (or empty / pick prompt when none).
- Extend `shopFlow.test.tsx`: buy optional, BlockedSheet Игрушка «Сделать целью», one-shot label. Savings Celebration buy-from-shop can land in 06 if this file would duplicate the whole hub.

## Done when

`npm test -- src/ui/__tests__/shopFlow.test.tsx` and `npm run typecheck` pass.
