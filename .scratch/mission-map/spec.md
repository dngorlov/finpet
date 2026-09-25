# Карта заданий: уроки Саввы на карте Москвы

Status: stage 1 + stage 2 content done (branch `feat/mission-map`)

## Problem Statement

Task from Александр Лузин (2026-09-24): replace the Задания list with an interactive map of Moscow. Each district pin is a mission; tap → description + «Начать». Strict order: first only the budget lesson, then the first lessons of the other topics and the second budget lesson, then each topic in order. Reward depends on answer quality; the sheet shows how much more can be earned and the difficulty. Fill every lesson with Савва's cards and mini-games (Google Doc scenario + Miro mini-game cards).

## Decisions (asked 2026-09-24)

- The map **replaces** the Задания list (tile «Задания» → «Карта заданий»).
- Unlock **by completion only** — the old «one new task per day» rule is gone. Демо-режим opens every pin (R13).
- Reward = mission max × share of first-try answers (right 1, «с ценой» ½, wrong 0). A replay pays only the improvement over `taskProgress.bestReward` (migration 4).

## What shipped

- `core/tasks.ts`: `missionPrerequisite`, `unlockedTasks(tasks, completedIds, isDemo)`, `earnedReward`, `rewardTopUp`, `rewardLeft`, `scoredUnits`, `sortVerdict`; node kinds `card` / `sort`.
- `tasks.json`: 6 lessons (3 cards each, as in the scenario) + games: «Нужно или хочется?» (sort + budget priority), «План и факт» (make a plan, find the difference, backpack safe error → «Почини рюкзак»), savings test (4 questions verbatim), «Финансовая мечта» (dream / saved / deposit / deadline — does it fit, what to change), «Правильный платёж» (Оплатить vs Проверить, card vs cash, not enough money, check after paying), «Покупки» check; bonus after «Покупки»: «Скидка или ловушка» (sort + savings sum + tip), «Что дешевле?» (levels: price, per item, need), «Охота за ценником» (find the tag, fit the budget, «Знаешь ли ты?», discount at the till, receipt error).
- `TaskListScreen` = map: `assets/map/moscow.png` (placeholder art) + pins in % of the box, dotted links from prerequisite, mission sheet, correction tasks below.
- `TaskRun`: cards, sort game, `{pet}` → pet name, score collected on first answers. `TaskResult`: «Верно с первого раза: X из Y», «+N монет» (top-up only), «можно получить ещё N», «На карту».

## Deviations from the scenario (tell Савва)

- «Финни» → the child's own pet name via `{pet}`; the app has no separate mentor.
- «Зачем нужен банк» card: «открыть накопительный счёт / функция Банка» → our Копилка. A real bank / вклад with interest is not built; the вклад card stays as theory + one question.
- Mini-games are built from three reusable node kinds (card, choice, sort) instead of bespoke screens. «Охота за ценником» describes the shelf in text instead of a drawn shop.

## Open

- Andrei's Moscow map PNG without pins → replace `assets/map/moscow.png` (3:4); pin coordinates live in `tasks.json`.
- Arrows instead of dotted links; pin labels on the map.
