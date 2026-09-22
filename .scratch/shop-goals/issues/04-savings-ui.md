# 04: Копилка UI

**What to build:** Копилка shows a catalog Цель, funds without spending, Celebration «Купить из копилки» / «Позже», drop, and entry into the shared picker. No Настроение on reach.

**Blocked by:** 03

**Type:** task

**Status:** resolved

## Pointers

- Spec: `.scratch/shop-goals/spec.md` (stories 1, 3, 11–23, 25–32, 44–46; Копилка UI decision)
- Map: `.scratch/shop-goals/map.md`
- Prior art: `src/ui/screens/SavingsScreen.tsx`, `src/ui/__tests__/savingsFlow.test.tsx`, `src/ui/strings.ts`

## Must

- Replace three preset chips with active-Цель card (catalog name/price) + picker entry + drop (pot unchanged).
- Deposit still FeedbackCard Баланс/Копилка. When funded: Celebration «Мечта сбылась!» with **Купить из копилки** and **Позже**. No «Настроение +10». No forced «Выбери новую цель» on this screen.
- Позже keeps the funded Цель. Купить из копилки calls `purchaseFromSavings`, then FeedbackCard (item meter, Копилка delta), then **Выбрать новую цель** opening the same picker 05 owns (coordinate on one component; 04 may ship a local picker if 05 has not merged — 05 must converge on one).
- «Забрать» preview + second confirm stay. No Цель: still allow withdraw.
- Extend `savingsFlow.test.tsx` for deposit estimate, withdraw confirm, Celebration without +10, Купить/Позже. Full shop-side coverage waits for 05/06 if picker lives there.
- Kid copy: «мечта» allowed on Celebration/withdraw preview; entity stays Цель.

## Done when

`npm test -- src/ui/__tests__/savingsFlow.test.tsx` and `npm run typecheck` pass.

## Answer

Копилка UI now shows the active catalog Цель (name/price/progress) with «Выбери цель» / «Убрать цель» (`clearActiveGoal`, pot unchanged). Shared `GoalPicker` lists optional items not owned-`once`, marks the current Цель, confirms replace with «Цель станет {name}. В копилке останется {pot}.», and exposes drop. Deposit FeedbackCard is Баланс/Копилка only; funding opens Celebration «Мечта сбылась!» with «Купить из копилки» / «Позже» (no mood, no forced picker). Позже keeps the funded Цель; Купить calls `purchaseFromSavings`, then FeedbackCard (item meter + Копилка delta), then «Выбрать новую цель» opens the picker. `savingsFlow.test.tsx` and `tsc --noEmit` pass.
