# Счета дня: план, который можно и нужно соблюдать

Status: done (branch `feat/day-bills`)

## Problem Statement

Raised by Александр Лузин 2026-09-20: планирование бюджета — «бесполезная фигня». По коду:

- «Обязательное закрыто» required **all four** mandatory items every day (45/day incl. Лекарство) against Пособие 10/day + 7 one-time Задания × 10. Over 5 demo days: 220 in, 225 required — even perfect play fails, a Цель is out of reach, so no split is meaningful.
- The child guessed the Обязательные bucket: План never said what today's mandatory items cost.
- «По плану» was `purchases ≤ Обязательные + Желаемые`: a Копилка promise was never checked.
- Nothing on План linked the split to the Цель.

## Solution

1. **Счета** — `catalog.json` `bills`: a 5-day cycle of mandatory items due that day (Обед+Проезд 20 · +Школьные 30 · +Лекарство 35 with note «Питомец простыл…» · +Школьные 30 · Обед+Проезд 20). Only today's Счета count for «обязательное закрыто» and the −15 Забота. Content loader rejects a bill id that is not a mandatory catalog item.
2. **Пособие 10 → 20.** 5 days: 100 + 100 + up to 70 (Задания) = 270 in, 135 Счета → ~135 free: Скейтборд (90) is reachable with a kept План and Задания, Телескоп is not in 5 days. Real trade-off.
3. **План draft** (order = order of decisions): «Сегодня пришло: +N» · «Можно распределить» · card «Счета на сегодня» · Обязательные prefilled with Счета and floored at them (`AmountStepper min`) · Копилка with live Цель forecast · Желаемые with «Хватит на: …». Floor is clamped to Баланс so a short child can still plan; the card then says how much is missing and points to Задания.
4. **«По плану» per bucket** (`core/economy.planKept`): Желаемые ≤ plan, Копилка deposits ≥ plan, purchases ≤ Обязательные + Желаемые.
5. `confirmPlan(profileId, dayId, minMandatory)` re-checks the floor in the repository.

## Out of scope / open

- Auto-transfer of the Копилка bucket at confirm («заплати себе первым») — contradicts plan-rework Q1.1, needs Дима's call.
- Mid-day random events, «Обещание сдержано» streak, «нужно сегодня» badge on Магазин cards.
