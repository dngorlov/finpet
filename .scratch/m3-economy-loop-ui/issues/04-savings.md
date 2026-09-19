# 04: Копилка deposits, withdrawal, and Цели

**What to build:** A child can open Копилка from Main, see the pot and active Цель (estimate «—» until the first deposit), switch among the three presets, «Положить» with confirm, and «Забрать» through a preview that shows pot-after and how many days the Цель moves, then a second confirm. Reaching the cost shows Celebration «Мечта сбылась!» and Настроение up. Every movement uses FeedbackCard.

**Blocked by:** 02

**Status:** resolved

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (Копилка stories, achievement +10 mood)
- Existing `savingsState`, `transferToSavings`, `withdrawFromSavings`, `setActiveGoal`, `listGoals`
- Core `estimateDaysToGoal` for the preview date shift
- FeedbackCard from ticket 02

## Must

- Replace the Копилка stub. Pot, active-Цель card, picker of three presets; achieved Цели visible but not selectable.
- «Положить»: stepper ≤ Баланс, confirm, FeedbackCard.
- «Забрать»: amount → WithdrawPreview (pot after, days shifted) → separate confirm → FeedbackCard. Bound by pot.
- `achieved: true` → Celebration then FeedbackCard including Настроение. Prompt to pick another Цель if one remains.
- Switching active Цель is allowed anytime for non-achieved presets and does not move Монеты.
- Navigation-root coverage for deposit, estimate leaving «—», withdrawal second confirm, and (with a fake that can mark achieved, or a small transfer sequence) Celebration.

## Done when

Appendix A step 8 is playable in the UI test. `npm test` and `npm run typecheck` pass.

## Answer

Копилка shows the pot, active Цель, and three presets. Deposits and double-confirmed withdrawals use FeedbackCard. Reaching the cost shows «Мечта сбылась!» and Настроение +10.
