# Spotlight «Как играть» walkthrough

Status: ready-for-agent

## Problem Statement

A ребёнок meets the rules as three pet speech cards on a blank «Как играть» screen, before Main exists. They hear about План, Магазин, and Копилка without seeing them. Then they land on a crowded hub and the explanation is already gone. They need a short walkthrough on the real screens: dim the rest, spotlight one control, read a line, press «Дальше», and actually open План / Магазин / Копилка — without spending монеты or locking a plan.

## Solution

Remove the pre-Main pet-speech «Как играть» phase. **Имя** «Дальше» writes the Профиль ребёнка and goes to Стартовый бюджет, then Main. After the Пособие FeedbackCard «Понятно», start «Как играть»: a dim overlay, one spotlight hole, an anonymous explanation (not the Питомец, not Помощник), and overlay «Назад» / «Дальше» / «Пропустить».

The overlay teleports through real screens. Taps that would spend, lock a plan, or start a Задание do not run until the overlay is gone. Shop may open an item / confirm sheet so they see «Купить»; it does not debit. Replay from Словарик runs the same overlay on the live hub, without the Пособие card, still with no writes.

## User Stories

1. As a ребёнок who finished Имя, I want «Дальше» to create my Профиль ребёнка and open Стартовый бюджет, so that I am not stuck on three rule cards before I have a pet in the game.
2. As a ребёнок, I want Стартовый бюджет unchanged, so that the +100 grant is still explained once.
3. As a ребёнок on first Main, I want the Пособие FeedbackCard first, so that the grant +10 is not buried under a spotlight.
4. As a ребёнок who taps «Понятно» on Пособие, I want «Как играть» to start, so that the walkthrough follows the money I just received.
5. As a returning ребёнок, I want launch to skip Первый запуск and skip the walkthrough, so that I am not tutored every day.
6. As a ребёнок who force-quits on Стартовый бюджет, I want the next launch to open Main and still offer «Как играть» after Пособие (if credited) or immediately (if not), so that I do not lose the walkthrough.
7. As a ребёнок in the walkthrough, I want the rest of the screen dimmed and one control bright, so that I know what the sentence is about.
8. As a ребёнок, I want a short overlay message, so that I get one idea per step.
9. As a ребёнок, I do not want the Питомец to speak these steps, so that this is not another speech-bubble lesson.
10. As a ребёнок, I do not want Помощник, so that the overlay is not a chat.
11. As a ребёнок, I want overlay «Дальше», so that I always have a way forward without hunting the hole.
12. As a ребёнок, I want overlay «Назад», so that I can re-read the previous hole.
13. As a ребёнок, I want overlay «Пропустить», so that the walkthrough never traps me.
14. As a ребёнок who skips, I want a normal Main with no extra purchases or a confirmed plan, so that skip only skips explanation.
15. As a ребёнок on beat 1, I want Android Back to skip the walkthrough, so that hardware Back is not a trap back into Стартовый бюджет.
16. As a ребёнок on a later beat, I want Android Back to match overlay «Назад», so that the keys agree.
17. As a ребёнок, I want beat 1 on Main with the hole on План, so that I meet the first step of the Игровой день.
18. As a ребёнок who presses overlay «Дальше» on that beat, I want to land on План with the three buckets spotlighted, so that I see Обязательные / Желаемые / Копилка.
19. As a ребёнок on План during the walkthrough, I want «Подтвердить план» not to lock a plan, so that practice does not consume the day.
20. As a ребёнок who presses «Дальше» on План, I want Main with the hole on Магазин.
21. As a ребёнок who presses «Дальше» there, I want Магазин on Обязательное with one item (Обед) reachable, so that I see a real shelf.
22. As a ребёнок, I want to open that item and see «Купить» / after-price, so that I learn the purchase shape.
23. As a ребёнок, I want «Купить» not to debit Баланс, not to change Забота, and not to write Журнал, so that the money lesson stays honest.
24. As a ребёнок who presses «Дальше» in Магазин, I want Main with the hole on Копилка.
25. As a ребёнок who presses «Дальше» there, I want Копилка home with the hole on Положить.
26. As a ребёнок, I want Положить not to move coins, so that the tour does not touch the pot.
27. As a ребёнок who presses «Дальше» on Копилка, I want Main with the hole on the active Задание card.
28. As a ребёнок, I want that step to say a Задание is a money story and +10 once, so that I know why «Играть» exists.
29. As a ребёнок, I want «Играть» on that card not to open TaskRun until the overlay is gone, so that I cannot earn the reward inside the tour.
30. As a ребёнок on the last «Дальше», I want the overlay gone and the hub live, so that I can plan and buy for real.
31. As a ребёнок, I want overlay «Назад» to reverse those teleports (Копилка → Main → Магазин → …), so that backtracking is the tour, not the stack.
32. As a TalkBack user, I want the overlay message and the three overlay actions named, so that I can finish without seeing the hole.
33. As a TalkBack user, I want dimmed controls not offered as the next action, so that I do not activate План while the tour is talking.
34. As a ребёнок with the overlay up, I want live economy actions ignored or inert (confirm plan, Купить, Положить, Забрать, Играть, Закончить день), so that practice cannot mutate the day.
35. As a ребёнок opening Словарик → «Как играть», I want the same overlay on current Main, so that help is not a different product.
36. As a ребёнок replaying, I want no second Пособие card, so that replay does not look like a new grant.
37. As a ребёнок replaying after a purchase or a locked plan, I want the same holes anyway, so that a messy day does not break help.
38. As a ребёнок replaying when tiles are disabled (waiting until tomorrow), I want the hole to still explain the word, so that wait-state is not a dead tour.
39. As a ребёнок replaying with no Задание card, I want beat 7 skipped, so that an empty hub does not spotlight nothing.
40. As a ребёнок who already finished or skipped the tour, I want Словарик still able to replay it, so that help is not one-shot.
41. As a ребёнок, I want no profile write from the tour itself, so that skip/finish only marks the walkthrough done.
42. As a разработчик, I want a single “walkthrough done” marker set on skip or last «Дальше», so that first Main can auto-start and later launches do not.
43. As a разработчик, I want overlay copy in versioned content, so that the seven sentences can change without screen logic.
44. As a разработчик, I want REQUIREMENTS and ROADMAP to describe commit-on-Имя and spotlight «Как играть» after Пособие, so that docs do not still require three pet bubbles before Main.
45. As a разработчик, I want CONTEXT.md’s «Как играть» definition left as the spotlight walkthrough, so that it is not reverted to pet speech.
46. As a разработчик, I want the old HowToPlay pet-card UI retired once both first-run and Словарик use the overlay, so that two tutorials cannot drift.
47. As an accessibility reviewer, I want tests to query overlay «Дальше» / «Назад» / «Пропустить» and the visible step copy, so that TalkBack and the suite share one contract.

## Implementation Decisions

- Scope is «Как играть» plus the Первый запуск commit boundary. Do not change bead sliders, Имя cloud, Стартовый бюджет copy/amount, meters, or the live economy once the overlay is gone.
- Drop the FirstRun `rules` / HowToPlay phase. Valid Имя «Дальше» calls the existing complete-first-run operation (same dual-write of pet name, grant of Стартовый бюджет in that operation as today) and resets navigation to StartingBudget. Failure/retry stay on Имя.
- Launch routing stays “active profile → Main, else FirstRun.” Add a walkthrough-done meta marker, unset on Удалить профиль. If the marker is unset, Main starts «Как играть» after the Пособие card is dismissed (or immediately if that card is not shown). If the marker is set, Main is live. Словарик «Как играть» starts the overlay regardless of the marker and does not clear it until skip/finish of that replay (replay finish may leave the marker set).
- Tour chrome: one dim layer, one hole, one overlay message, quiet «Назад» / «Дальше» / «Пропустить». Not Помощник. Not SpeechBubble. Not petSays. Overlay «Дальше» is the required advance. The hole is visual; it must not be the only way forward. During the tour, confirm-plan, Купить (debit), savings transfer, TaskRun, and Закончить день must not succeed.
- Beat order (overlay «Дальше» teleports): Main/План → План buckets → Main/Магазин → Магазин обязательное item (Обед) including confirm UI if that is how Купить is shown, without a write → Main/Копилка → Копилка Положить without a transfer → Main/Задание card. Last «Дальше» or any «Пропустить» dismisses overlay, sets the marker, leaves the child on Main. «Назад» reverses beats. Android Back = «Назад»; on beat 1 = «Пропустить».
- Shop: the child may see the item and the confirm copy. Completing Купить is a no-op for money, meters, and Журнал while the overlay is up. Do not show a fake success. Do not restore coins (there is nothing to restore).
- Задание beat: spotlight the hub card. «Играть» does not navigate. If the card is absent, skip the beat.
- Replace hint.json pet-card bodies with seven walkthrough sentences (or an equivalent content list). Keep content versioning. Remove or stop rendering HowToPlay pet cards once both entry points use the overlay.
- Update REQUIREMENTS (R1 sequence: Имя commits; «Как играть» is the post-Пособие spotlight tour) and ROADMAP FirstRun / «Как играть» / Appendix A. Do not revert CONTEXT.md.
- No schema migration beyond optional meta key for the marker (meta is already a key-value store). No ADR unless the commit-boundary move needs one — it does not: easy to reverse, not surprising if docs say so.

## Testing Decisions

- A good test asserts what the child can see and do: Имя «Дальше» calls complete once and lands on Стартовый бюджет; Main shows Пособие then overlay; seven beats’ copy and destinations; «Купить» / confirm plan / Играть do not change profile money or plan status; skip from beat 1; Back reverses; Словарик replay; marker prevents auto-start next launch. It does not assert overlay pixel geometry, dim opacity, or hole coordinates.
- Use one seam: the existing navigation-root first-run flow suite with injected session ports. Extend that suite; do not add a tour-component test file. Live shop/plan suites keep testing real purchases; they are not the tour.
- Follow RNTL v14: async `render`, `screen`, `userEvent`, role/name queries. Prior art is `firstRunFlow.test.tsx` (reachHowToPlay, skip cards, Словарик replay).
- Replace pet-bubble assertions (`petSays`, «Играть!» on rule step 3, skip from three card steps) with overlay queries («Дальше», «Пропустить», step copy). Helper that used to reach HowToPlay cards now completes Имя and, if needed, StartingBudget + Пособие «Понятно».
- Cover: complete is not called before Имя «Дальше»; called once there; skip tour does not call complete again and does not change balance beyond starting grant + Пособие; opening Обед and pressing Купить during the tour leaves balance unchanged; replay from Словарик shows overlay without a second Пособие card and without complete.
- Device acceptance: hole tracks the control at 360 dp; dim is not a second scroll trap; keyboard not involved.

## Out of Scope

- Помощник, pet-spoken rule cards, sandbox debit-and-restore, a required real Обед.
- Teleport into TaskRun, Итоги дня, Взрослый раздел, or Settings.
- Changing Стартовый бюджет amount, Пособие amount, catalog prices, or plan rules after the overlay is gone.
- Animation beyond dim/hole, sound, or talking poses.
- Rewriting Имя cloud or bead sliders.

## Further Notes

- Grill locked: commit on Имя; tour after Пособие «Понятно»; practice (Q5/Q8/Q14 A); overlay pager not hole-only advance; skip kept; anonymous copy; seven beats including hub Задание; Android Back as specified; Словарик replay safe; no restore fiction.
- CONTEXT.md already defines «Как играть» as this walkthrough. Do not restore “Питомец speaks scripted guidance” for these steps.
- Historical first-run-redesign / pet-name specs still describe pet-card «Как играть»; append supersession comments rather than rewriting those stories.
