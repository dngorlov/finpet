# M1 — Domain core

Status: ready-for-agent
Source: docs/ROADMAP.md §7 M1, §2 (settled decisions), §3 (architecture), §3.2 (schema), §5 (content contracts), §8 (test plan).

## Problem Statement

The app currently has only an M0 scaffold: a `meta` table, placeholder content files, and empty repository anchors. None of the game's rules — Монеты grants, plan validation, purchases, Копилка/Цель math, Этапы scoring, Игровой день gating, Задание runner — exist as testable code. The whole economy must be trustworthy before any UI is built on it, and the hackathon test plan mandates automated coverage of budgeting, debiting, savings, and progress/stages plus day gating.

## Solution

The pure domain core (`src/core/`) plus the persistence layer (`src/data/`) of ROADMAP §3, with the real content JSON and zod validation. After M1, `npm test` is green with a jest suite covering all four mandated areas and day gating; no UI ships. Economy numbers come verbatim from ROADMAP §2.1–2.3 (100 старт · +10 Пособие · +10 reward · 8 catalog items · 3 goals · +2/+1/+1 day score · thresholds 3/9).

## User Stories

1. As a ребёнок, I want to receive 100 Монет once at profile creation, so that I can start playing immediately.
2. As a ребёнок, I want +10 Монет (Пособие) credited the first time I open each new Игровой день, so that I have funds to plan with.
3. As a ребёнок, I want to distribute my balance across Обязательные / Желаемые / Копилка in a plan, so that I learn to budget before spending.
4. As a ребёнок, I want plan confirmation to be blocked when the buckets exceed my available amount, so that I can never plan money I don't have.
5. As a ребёнок, I want my confirmed plan to be locked for the day, so that the day's plan-vs-actual comparison is honest.
6. As a ребёнок, I want a purchase to be rejected when my balance is insufficient, so that my balance can never go negative.
7. As a ребёнок, I want every coin movement recorded as a transaction with a reason, so that my Журнал explains every change.
8. As a ребёнок, I want Забота/Настроение to change only through explicit events with a source, so that meters never change silently.
9. As a ребёнок, I want mandatory purchases to raise Забота and skipped mandatory items at day close to lower it, so that caring for my pet matters.
10. As a ребёнок, I want optional purchases to raise Настроение and over-plan optional spending to lower it, so that wants have visible effects.
11. As a ребёнок, I want to deposit into the Копилка toward one active Цель, so that saving is visible and attributed.
12. As a ребёнок, I want my Копилка balance to never go below zero, so that withdrawal is bounded by what I saved.
13. As a ребёнок, I want reaching a goal's cost to mark it achieved and reduce the pot by the cost, so that the dream comes true.
14. As a ребёнок, I want a completion-date estimate for my goal (remaining ÷ average recent deposit, «—» before the first transfer), so that I see what skipping costs.
15. As a ребёнок, I want my day score computed as +2 all mandatory bought · +1 spend within plan · +1 deposit made, so that good habits are rewarded.
16. As a ребёнок, I want my Этап recomputed over the last 3 closed days (<3 Новичок, 3–8 Друг, ≥9 Мастер) with a kid-worded explanation when it changes.
17. As a ребёнок, I want the next Игровой день to unlock only after local midnight in normal play, so that the day cadence matches real days.
18. As a демо-игрок, I want days back-to-back under a manual clock, so that 5+ consecutive days are playable for the jury.
19. As a ребёнок, I want to play Задания node by node with verdict/explanation on every option, so that wrong choices teach instead of punish.
20. As a ребёнок, I want task rewards paid only on first correct completion, so that replays are practice, not farming.
21. As an adult/juror, I want the profile balance to always equal the sum of its transactions and never be negative, so that the economy is provably consistent.
22. As a developer, I want the catalog, goals, terms, hint and tasks as versioned zod-validated JSON, so that new content ships without code changes.

## Implementation Decisions

- `src/core/` stays pure: no React/Expo/React Native imports; plain jest only. Modules: economy (grants, allowance, purchase validation, plan validation), savings (transfers, goal math, date estimate), stages (day score, rolling window, thresholds, change explanation), days (open/close/unlock via Clock), tasks (generic node runner), clock (port + SystemClock + ManualClock).
- Clock is a port (per ADR-0002): all "today"/"midnight" reads go through it. Normal play: next day unlocked at local midnight after the previous day closed; demo: always unlocked.
- Storage follows ROADMAP §3.2 exactly (profiles, days, plans, transactions, purchases, savingsTransfers, goals, petState, meterEvents, dayScores, taskProgress, meta) as one new migration on top of M0's `meta`.
- Repositories own the invariants (balance == Σ transactions, balance ≥ 0, Копилка ≥ 0, confirmed plan immutable) by exposing intent-level operations (grant, creditAllowance, purchase, transfer, withdraw, closeDay) rather than raw row writes. Each coin movement writes its transaction row and (when applicable) purchase/meterEvent rows atomically.
- Content loader imports `assets/content/*.json` and validates with zod against ROADMAP §5 schemas, checking `contentVersion`. The five files are filled with the settled content (8 catalog items, 3 goals, 10 terms, 3 hint cards, 6 task scripts from §6) — tasks are data now so M4 only builds the runner UI.
- Drizzle schema is defined once and shared; tests run the same migrations against an in-memory SQLite driver (better-sqlite3, dev-only) so repository tests are real SQL, not mocks.

## Testing Decisions

- Only external behavior is tested: pure functions get input/output assertions; repositories are tested through their public operations plus direct SQL reads for invariant checks (Σ transactions vs balance), never by inspecting internals.
- Two jest projects: the RN-preset project for core/UI, and a node project for repository tests (native better-sqlite3 module cannot load under the RN transform). Prior art: `src/data/__tests__/runMigrations.test.ts` (driver-port pattern).
- Coverage per ROADMAP §8: plan validation (sum ≤ available, draft editable, confirm locks); debit (over-balance rejected, never negative, history written); savings (in/out, withdrawal gating, goal completion, estimate «—» before first transfer); stages (+2/+1/+1, rolling 3, thresholds 3/9, explanation on change); days (calendar unlock via fake Clock; ManualClock back-to-back); persistence roundtrip + balance invariant.

## Out of Scope

- Any UI (screens, components) — M2+.
- Взрослый раздел, demo profile switching UI, day-close screens — M4/M5 (only the Clock/day-unlock rules land here).
- Stretch tier (§2.6) entirely.
- Android build changes.

## Further Notes

- Economy constants live in one config module in `src/core` (ROADMAP §10 risk note), content numbers in JSON.
- М4 will consume `tasks.ts` unchanged; the runner must be generic (a new task is data only).

## Comments

**2026-09-19 — implemented.** Domain core, zod content loader, schema migration v2, and `createGameRepository` intent operations. `npm test` 54/54 green (two jest projects: app + better-sqlite3 data), `npm run typecheck` and `npm run lint` clean.

Notes for later milestones:
- Starting Забота/Настроение are 50 (not settled in ROADMAP; midpoint in `src/core/config.ts`). Goal-achievement Настроение bonus is +10 for the same reason.
- `payments_two_prices` N1 good path goes to N2 so the second node is reachable (script text said `exit`).
- `applyTaskStep` + `claimTaskReward(..., correct)` are the persistence seam M4's runner UI should call; no screens shipped.

Superseded in part 2026-09-21 by `.scratch/shop-goals/spec.md`: story 13 (pot − cost + `status: achieved` on reach) and the comment that goal-achievement Настроение is +10 are no longer current product. Deposit leaves the pot; Настроение moves only when a Желаемое is actually bought. Catalog is 11 items; Цели come from those rows, not a parallel presets file.
