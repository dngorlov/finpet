# Tooltip «Как играть» and centered Пособие

Status: ready-for-agent

## Problem Statement

A ребёнок who just finished Стартовый бюджет gets a bottom sheet that does not dim the hub, cannot be dismissed by anything but «Понятно», and talks in unlabeled «Потому что начался новый игровой день» / «Что дальше: составь план дня». Then «Как играть» covers the hub with a top card, teleports on «Дальше», uses clumsy copy («Дальше откроет План»), misses the План highlight, and lets the spotlight slide away when the hub scrolls. They cannot tell what to tap or what the money sheet was for.

## Solution

Every FeedbackCard is a centered sheet over a full-screen tap-catch (hub behind is not tappable). Only the tutorial Пособие (the one that precedes first-run «Как играть») visually dims the hub. That card shows «Баланс +10», a category chip «Начало игрового дня», and a **Дальше** bar — no «Понятно», no tap-outside, no «что дальше» sentence, no «награда». Daily Пособие and other FeedbackCards stay undimmed, keep «Понятно», and keep their existing cause lines (Пособие still uses the chip instead of «Потому что…»).

«Как играть» is a dim spotlight plus a small tooltip next to the control. Hub destinations open when the child taps the spotlighted tile (План, Магазин, Копилка). Overlay «Дальше» does not teleport. On План / Магазин / Копилка / Задание, looking is enough: tooltip + «Дальше»; Купить, «Подтвердить план», Положить/Забрать, and Играть do not write or start a run. Scroll is frozen while a beat is up. Skip / Назад stay.

## User Stories

1. As a ребёнок, I want every FeedbackCard in the center of the screen, so that I am not fishing for a strip at the bottom.
2. As a ребёнок with a FeedbackCard open, I want taps on the hub behind it to do nothing, so that I cannot plan or buy through the gap.
3. As a ребёнок on a normal day, I want Пособие without a dim overlay, so that the daily +10 is not a second tutorial.
4. As a ребёнок whose «Как играть» has not been finished or skipped yet, I want that first Пособие dimmed, so that the +10 is the only thing to look at.
5. As a ребёнок on that tutorial Пособие, I want a chip «Начало игрового дня», so that I see a category, not a «потому что» sentence.
6. As a ребёнок, I do not want the word «награда» on that chip, so that Пособие is not mixed up with Родительский бонус.
7. As a ребёнок, I want «Баланс +10» on that card, so that the money change is first.
8. As a ребёнок, I do not want «Что дальше: составь план дня» on that card, so that the next action is a button, not a lecture.
9. As a ребёнок, I do not want «Потому что начался новый игровой день» as body copy on Пособие, so that the chip carries the why.
10. As a ребёнок on tutorial Пособие, I want a «Дальше» bar, so that I continue into «Как играть» the same way I continue Имя.
11. As a ребёнок on tutorial Пособие, I do not want «Понятно», so that two different confirm labels are not used for the same step.
12. As a ребёнок, I cannot dismiss tutorial Пособие by tapping the dim, so that I do not skip the +10 by accident.
13. As a ребёнок, I want Android Back on tutorial Пособие to do nothing that skips the card, so that hardware Back is not a trap into a half-read grant.
14. As a returning ребёнок, I want daily Пособие centered, undimmed, chip «Начало игрового дня», «Понятно», so that the everyday card matches the new layout without the tutorial dim.
15. As a ребёнок who just bought Обед, I want the purchase FeedbackCard centered with «Понятно» and the existing cause line, so that this pass does not rewrite shop feedback copy.
16. As a ребёнок on savings or Задание feedback, I want the same: centered, undimmed, «Понятно», existing cause, so that only Пособие loses the «потому что» sentence.
17. As a ребёнок who finished tutorial Пособие «Дальше», I want «Как играть» to start on Main with the hole on План, so that the grant and the plan lesson are in order.
18. As a ребёнок on a hub beat, I want a short tooltip next to the spotlighted control, so that the explanation sits on the thing, not on a sheet covering it.
19. As a ребёнок, I want that tooltip not to sit on top of the control, so that I can still see and tap План.
20. As a ребёнок, I want the rest of the hub dimmed around the hole, so that one control is bright.
21. As a ребёнок, I want the План tile’s “needs a plan” highlight still visible in the hole, so that the lesson tile is not a grey block.
22. As a ребёнок, I want the spotlighted tile scrolled into view before the tooltip shows, so that План is not below the fold.
23. As a ребёнок, I cannot scroll the hub (or the destination screen) while a beat is up, so that the hole and tooltip stay put.
24. As a ребёнок on the План beat, I want to tap План myself, so that I learn where the tile is.
25. As a ребёнок, I do not want overlay «Дальше» to open План for me, so that teleport is gone.
26. As a ребёнок, I want tapping Магазин and Копилка to work the same way, so that every hub destination is a tap I make.
27. As a ребёнок on a hub beat, I want overlay «Дальше» hidden, so that I am not offered two ways forward.
28. As a ребёнок, I want overlay «Назад» and «Пропустить» in a thin bar that does not cover the hole or the tooltip, so that I can still skip or go back.
29. As a ребёнок on beat 1, I want overlay «Назад» and Android Back to skip the walkthrough, so that I am not sent to Стартовый бюджет.
30. As a ребёнок on a later beat, I want overlay «Назад» and Android Back to reverse beats, so that the keys agree.
31. As a ребёнок who taps План, I want the Plan screen with a tooltip on the three buckets and overlay «Дальше», so that I see Обязательные / Желаемые / Копилка without having to confirm.
32. As a ребёнок, I want «Подтвердить план» not to lock a plan during the tour, so that practice does not consume the day.
33. As a ребёнок who presses «Дальше» on План, I want Main with the hole and tooltip on Магазин.
34. As a ребёнок who taps Магазин, I want the shop on Обязательное with Обед visible and overlay «Дальше», so that I can look without buying.
35. As a ребёнок, I may open Обед and see price / «Купить», so that I learn the purchase shape.
36. As a ребёнок, I want «Купить» not to debit Баланс, not to change Забота, and not to write Журнал, so that looking stays honest.
37. As a ребёнок, I am not required to open Обед or press «Купить», so that «Дальше» is enough to leave the shop.
38. As a ребёнок who presses «Дальше» in Магазин, I want Main with the hole on Копилка.
39. As a ребёнок who taps Копилка, I want Копилка home with a tooltip near Положить and overlay «Дальше».
40. As a ребёнок, I want Положить / Забрать not to move coins, so that the tour does not touch the pot.
41. As a ребёнок, I am not required to press Положить, so that looking is enough.
42. As a ребёнок who presses «Дальше» on Копилка, I want Main with the hole on the Задание card.
43. As a ребёнок, I want «Играть» not to open TaskRun, so that I cannot earn +10 inside the tour.
44. As a ребёнок, I am not required to press «Играть»; overlay «Дальше» finishes the tour.
45. As a ребёнок on the last «Дальше» or on «Пропустить», I want the overlay gone, walkthrough marked done, and the hub live.
46. As a ребёнок, I want skip to leave no extra purchase and no confirmed plan.
47. As a TalkBack user, I want the tooltip text and the overlay actions named, so that I can finish without seeing the hole.
48. As a TalkBack user on a hub beat, I want the spotlighted tile offered as the way forward, so that I tap План rather than a hidden «Дальше».
49. As a ребёнок opening Словарик → «Как играть», I want the same tooltip tour on current Main, without a Пособие card.
50. As a ребёнок replaying when tiles are disabled (waiting), I still want the hole and tooltip on the word, and tap still opens the screen for looking, so that wait-state is not a dead tour.
51. As a ребёнок replaying with no Задание card, I want that beat skipped.
52. As a разработчик, I want the seven tooltip sentences in versioned content, so that copy can change without screen logic.
53. As a разработчик, I want REQUIREMENTS / ROADMAP «Как играть» to describe tap-to-go, tooltip, frozen scroll, and tutorial Пособие dim + chip + «Дальше», so that docs do not still say teleport + top overlay card.
54. As a разработчик, I want CONTEXT.md’s «Как играть» left as tooltip + tap-to-open, so that it is not reverted to a covering overlay.
55. As a разработчик, I want the previous spotlight-tour spec left as history plus a supersession comment, so that we do not rewrite it in place.

## Implementation Decisions

- Scope is FeedbackCard layout (all callers) plus «Как играть» interaction and copy. Do not change Имя cloud, bead sliders, Стартовый бюджет screen, amounts, or live economy after the overlay is gone.
- FeedbackCard: always centered. Full-screen tap-catch so the hub is inert. Visual dim only when the caller marks the card as the tutorial Пособие (unset walkthrough marker, this is the allowance card that will start «Как играть»). No tap-outside dismiss. Android Back does not dismiss tutorial Пособие.
- Tutorial Пособие: chip «Начало игрового дня», deltas, «Дальше» (not «Понятно»). No cause sentence, no next-step sentence. Daily Пособие: same chip and deltas, no dim, «Понятно». Purchase / savings / task FeedbackCards: centered, undimmed, existing cause + next-step + «Понятно». Never use «награда» on the Пособие chip.
- Tour: keep the walkthrough-done marker, skip/finish semantics, and practice no-ops (confirm plan, purchase, savings transfer/withdraw, TaskRun, Закончить день). Change how beats advance and how copy is shown.
- Hub beats (Main/План, Main/Магазин, Main/Копилка): no overlay «Дальше». Spotlight + tooltip; the child taps the tile; that both navigates and advances. Destination beats (План buckets, shop, Копилка Положить, Main/Задание): tooltip + overlay «Дальше»; «Дальше» goes to the next beat (back to Main when the next hole is a hub tile). Last «Дальше» or «Пропустить» finishes. «Назад» reverses; beat 1 «Назад» / Android Back = skip.
- Shop: Купить is a no-op (no fake success). Opening Обед is optional. Overlay «Дальше» is required to leave the shop beat.
- Tooltip: small, adjacent to the hole, not covering it. Thin chrome bar for «Назад» / «Пропустить» / (destination) «Дальше» that does not cover the hole. Freeze scrolling on the current screen for the beat. Scroll the target into view, then measure the hole. Do not teleport on overlay «Дальше».
- Replace tour bodies with the seven accepted sentences: «Сначала составь план дня.» · «Обязательное, желаемое и Копилка.» · «Здесь покупают еду и вещи.» · «Можно посмотреть цену. Сейчас не покупаем.» · «Сюда откладывают на цель.» · «Так кладут монеты. Сейчас не кладём.» · «История про деньги. +10 один раз.» Keep content versioning (version 1 is fine if only bodies change).
- Update REQUIREMENTS / ROADMAP How-to-play / Appendix A first-launch / hint bullet. Append a supersession comment on the previous how-to-play-tour spec. Do not revert CONTEXT.md.
- No schema change beyond the existing walkthrough-done meta key. No ADR: layout and advance mode are easy to reverse.

## Testing Decisions

- A good test asserts what the child can see and do: tutorial Пособие is the chip + «Дальше» (not «Понятно», not «потому что», not «что дальше»); daily Пособие (returning child after openDay already credited) does not dim-start a tour; tap План/Магазин/Копилка advances; overlay «Дальше» is absent on those hub beats and present in the shop; Купить during the tour leaves balance 110; skip; Back reverses; Словарик replay has no Пособие card. It does not assert tooltip pixel offset, dim opacity, or hole coordinates.
- One seam: the existing navigation-root first-run flow suite. Live shop/plan/economy suites keep testing real «Понятно» FeedbackCards; update them only if queries break because the card moved (still «Понятно» + cause on purchase).
- RNTL v14: async `render`, `screen`, `userEvent`, role/name. Prior art: `firstRunFlow.test.tsx` (reachTour currently dismisses allowance with «Понятно» — that helper must press «Дальше» on tutorial Пособие). Replace teleport «Дальше»-through-hub assertions with tap-the-tile assertions.
- Cover: StartingBudget still «Понятно»; tutorial Пособие «Дальше» then План tooltip; tapping overlay «Дальше» on the План beat does not exist / does not open Plan; tapping the План tile does.

## Out of Scope

- Rewriting purchase / savings / task FeedbackCard copy into chips.
- Tap-outside-to-dismiss on any FeedbackCard.
- Requiring a real Обед, a confirmed plan, or a savings transfer in the tour.
- Помощник, pet-spoken cards, sandbox debit-and-restore.
- Имя cloud, bead sliders, Стартовый бюджет copy/amount.

## Further Notes

- Grill locked: center all FeedbackCards; dim only tutorial Пособие; chip «Начало игрового дня» not «награда»; tutorial «Дальше» not «Понятно»; no tap-outside; tap hub tiles to go; shop «Дальше» and no buy required; destination «Дальше»; tooltip + freeze scroll; seven copy lines as Q9.
- CONTEXT.md already defines «Как играть» as tooltip + tap-to-open. Do not restore covering overlay or teleport.
- Previous `.scratch/how-to-play-tour/spec.md` still describes teleport + top overlay; append supersession rather than rewriting those stories.
