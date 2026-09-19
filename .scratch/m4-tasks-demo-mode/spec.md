# M4 — Задания + Демо-режим

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 M4, §4.2 screens #8–10, 14, §2.3–2.4, §4.3 day loop / demo / correction, §5.3, §6 · `docs/REQUIREMENTS.md` Appendix A 6, 10, R8–R10, R13 · `CONTEXT.md` · ADR-0002 · M1/M2/M3 comments

## Problem Statement

A child can plan, shop, and save, but Задания is still a stub and «Закончить день» only promises Итоги дня later. They cannot play a Задание node by node, earn the first-completion reward, close an Игровой день, or see Этап change. Judges cannot walk five consecutive demo days back-to-back, reset the demo, or leave it without touching the child's profile. Appendix A steps 6 and 10 are not playable.

## Solution

Ship the generic Задание runner and the day-close loop exactly as ROADMAP §4.2 #8–10 and #14, plus a thin Демо-режим panel so the cadence AC is demonstrable before M5's arithmetic gate. From Main the child opens Задания (topic list, one new task per day in normal play, all six open in demo), plays a content-driven node graph with verdict + explanation on every tap, and may retry or receive a spawned correction task without losing progress. «Закончить день» on a confirmed plan closes the day, recomputes meters and Этап, and shows Итоги дня. Демо-режим uses a separate pre-onboarded profile: days follow back-to-back, «Сбросить демо» restores that profile's initial state, and exit returns to the child's profile untouched. After a normal close, the economy waits until tomorrow while Задания replays and Словарик stay open.

## User Stories

1. As a ребёнок, I want the Задания tile and the hub Задание card to open a real list instead of a stub, so that Appendix A step 6 is playable.
2. As a ребёнок on Задания, I want three topic groups — Бюджет, Копилки, Платежи — with two cards each, so that the three learning topics are visible at a glance.
3. As a ребёнок in normal play on Игровой день 1, I want only «Первый план» unlocked and the others labelled «Откроется: завтра», so that tasks arrive one per day in topic order.
4. As a ребёнок in normal play, I want each newly opened Игровой день to unlock the next topic-ordered Задание, so that by day 6 all six are available.
5. As a ребёнок in Демо-режиме, I want all six non-correction Задания open from day 1, so that a jury can play any scenario without waiting.
6. As a ребёнок, I want a locked card to explain the wait instead of doing nothing, so that there is no dead end.
7. As a ребёнок, I want an unclaimed first reward shown as «+10» on the card, so that I know practice later will not pay again.
8. As a ребёнок, I want a completed card to show that I finished it and still let me replay, so that I can practice without farming Монеты.
9. As a ребёнок whose safe-error spawned «Почини рюкзак», I want that correction card to appear in the list even though it is not one of the six topic tasks, so that I have a way to make things right.
10. As a ребёнок on Main, I want the hub Задание card to prefer an available correction, otherwise the first unlocked unfinished task, otherwise a completed one I can replay, so that the next useful Задание is one tap away.
11. As a ребёнок who taps «Играть» on a card or the hub, I want TaskRun to start on that Задание's intro and first node, so that the scene is the content JSON rather than hardcoded copy.
12. As a ребёнок in TaskRun, I want to see my named Питомец and the node text with option buttons ≥48×48 dp, so that choices feel like caring for the pet.
13. As a ребёнок who taps an option, I want a verdict banner with icon and word (✅ / 🤔 / ⚠️, never color alone) plus that option's explanation, so that every action teaches.
14. As a ребёнок after a verdict, I want «Дальше» to continue: retry the same node, go to the named next node, or leave to TaskResult on exit, so that the runner is a generic graph.
15. As a ребёнок on a `retry` option, I want to stay on the same node after the explanation, so that a wrong tap is a correction path rather than a reset.
16. As a ребёнок on an option that `spawnTask`s, I want «Новое задание появилось в списке!» after the explanation, so that the safe-error task is announced and progress is not wiped.
17. As a ребёнок whose option moves Забота or Настроение, I want those deltas visible with the verdict (and the pet pose reacting: happy / idle / sad), so that meters never change silently.
18. As a ребёнок whose option credits scene Монеты (the «Чек» refund), I want Баланс to move and a FeedbackCard to explain it, so that coins never move silently.
19. As a ребёнок who reaches TaskResult on a first good or warn exit, I want «+10 монет», a FeedbackCard, and Журнал row «Задание: {title}», so that the first correct completion pays once.
20. As a ребёнок who exits on a `bad` option, I want TaskResult without the +10, so that an unsuccessful finish still ends the scene without a reward.
21. As a ребёнок who later replays that same Задание and exits good or warn, I want the +10 if it was never paid, so that a first unsuccessful finish does not lock me out of the reward.
22. As a ребёнок who replays after the reward was paid, I want TaskResult with no coins, so that replays are practice.
23. As a ребёнок, I want «В список заданий» to return to the list with badges updated, so that I can pick another Задание or go back to Main.
24. As a ребёнок who cannot afford Игрушка, I want «Выполнить задание» on the BlockedSheet to open the real Задания list, so that the insufficient-funds way out is in-app and no longer a stub.
25. As a ребёнок whose План is not confirmed, I want «Закончить день» to keep prompting «Сначала составь план дня», so that I cannot close a day that never started.
26. As a ребёнок with a confirmed План, I want «Закончить день» to close the Игровой день and open Итоги дня, so that Appendix A step 10 is the real close sequence.
27. As a ребёнок on Итоги дня, I want plan-vs-actual per bucket, so that I see what I meant to do versus what I did.
28. As a ребёнок on Итоги дня, I want the day score as +2 / +1 / +1 with icons and words (mandatory covered, within plan, deposit made), so that the score is readable without color alone.
29. As a ребёнок on Итоги дня, I want Забота and Настроение deltas with one-line reasons (skipped Обязательные, optional overspend, or no change), so that day-close meter moves are explained.
30. As a ребёнок whose Этап changed, I want a banner with the new name (Новичок / Друг / Мастер) and the kid-worded explanation from the engine, so that a series of decisions is visible.
31. As a ребёнок whose Этап did not change, I want no fake celebration, so that the banner only appears when the rolling window actually moved.
32. As a ребёнок who skipped a mandatory catalog item, I want Забота to drop, the pet to look sad, and a next-day hint to plan for needs first — never a wiped profile, so that the safe-error rule holds at day close.
33. As a ребёнок in normal play on Итоги дня, I want «Ждём завтра!» to return to Main, so that the day is over until local midnight.
34. As a ребёнок on Main after a normal close and before midnight, I want a banner «Новый день откроется завтра», so that the wait is explained.
35. As a ребёнок in that waiting state, I want План, Магазин, and Копилка disabled with a short reason, so that the economy cannot run twice in one calendar day.
36. As a ребёнок in that waiting state, I want Задания replays and Словарик still open, so that waiting is not a dead end.
37. As a ребёнок in Демо-режиме on Main, I want a banner «Демо: дни идут подряд», so that I know this is the isolated test profile.
38. As a ребёнок in Демо-режиме on Итоги дня, I want «Следующий день» to open the next Игровой день immediately (Пособие FeedbackCard on first open), so that five days can be played back-to-back.
39. As an adult showing the app, I want Взрослый раздел to open a thin Демо-режим panel (no arithmetic gate yet) instead of a stub, so that M4's demo AC does not wait for M5.
40. As an adult, I want turning Демо-режим on to confirm «Демо создаёт отдельный тестовый профиль», so that I know the child's data is not the demo.
41. As an adult who confirms, I want a dedicated `isDemo` Профиль ребёнка (pre-onboarded names «Демо», default appearance, Стартовый бюджет already granted, no Первый запуск) to become active, so that demo play starts on Main.
42. As an adult, I want the child's profile id remembered while demo is active, so that exit can restore it.
43. As an adult, I want «Сбросить демо» to restore that demo profile to its initial state (day 1, Новичок, meters 50/50, empty economy except the grant, all six tasks open, no journal besides Стартовый бюджет until the next Пособие), so that a second jury pass starts clean.
44. As an adult, I want exiting Демо-режим to return to the child's Main with their Баланс, purchases, savings, Цель, Этап, and task progress unchanged, so that demo never mutates the real profile.
45. As a ребёнок on the child's profile after a closed day, I want the next Игровой день still blocked until local midnight even if demo days just ran, so that normal play stays real-day-gated (ADR-0002).
46. As a ребёнок on Прогресс → Итоги after the first close, I want the last day's score, plan-vs-actual, meter reasons, and Этап, plus overall days played, tasks done x/6, and goals achieved, so that the empty-state copy is replaced by history.
47. As a ребёнок on Журнал, I want task-reward and scene-coin rows labelled in kid language, so that those kinds are not raw keys.
48. As a ребёнок, I want every user-facing string in Russian, short, and without shaming, so that the 7–11 register holds.
49. As a ребёнок, I want body text ≥16 sp, targets ≥48×48 dp, and verdicts/status as icon + text, so that TaskRun and Итоги дня stay readable.
50. As a ребёнок, I want the app to stay fully offline with no new permissions, so that five demo days work in airplane mode.
51. As a ребёнок, I want visual response to taps within 1 s, so that option taps, day close, and demo switch feel immediate.
52. As a hackathon judge, I want Appendix A step 6 (complete a Задание, earn currency with explanation) and step 10 (next period, progress/stage after a series of decisions) passable on a device, so that M4's scenario slice is demonstrable.
53. As a hackathon judge, I want five consecutive demo Игровые дни playable back-to-back, reset to restore the demo, and exit to leave the child profile untouched, so that R13's demo AC holds.
54. As a разработчик, I want TaskRun to call existing `startTask` / `chooseOption` and persist through existing `applyTaskStep` / `claimTaskReward` / `closeDay`, so that M1 remains the only write path.
55. As a разработчик, I want new tasks to stay data in the versioned tasks file, so that a seventh Задание does not touch runner logic.
56. As a разработчик, I want chrome strings in the centralized strings module using CONTEXT.md terms, so that «урок», «квест», «тестовый аккаунт», or «уровень» never leak.
57. As an accessibility reviewer, I want option buttons, verdict banners, and primary actions exposed with accessible names that include the icon's word, so that tests and TalkBack share labels.

## Implementation Decisions

- **Reuse M1 writes; extend the existing SessionGame slice.** The game repository already implements `applyTaskStep`, `claimTaskReward`, `closeDay`, `createProfile({ isDemo })`, and `deleteProfile`. Do not add a parallel task engine, day-close reducer, or second clock in the UI. Extend the UI-facing session type (and the in-memory fakes) so jest-expo can drive the new screens. Live session keeps passing the real repository through.
- **Do not rewrite task content.** The six scripts plus the `budget_fix_backpack` correction already ship in the versioned tasks file. The runner is generic: load by id, `startTask`, `chooseOption` by index, apply the returned `TaskStepResult`.
- **Correct completion (reward policy).** A run that reaches `exit` is a completion. Pass `correct: true` to `claimTaskReward` only when that completing option's verdict is `good` or `warn`. A `bad` exit still marks the task completed but pays 0 and leaves `rewardPaid` false, so a later good/warn replay can earn the first +10. Replays after `rewardPaid` always pay 0. `retry` never claims.
- **When to persist a step.** On every option tap, after `chooseOption`, call `applyTaskStep` (meters, scene coins, spawn). Call `claimTaskReward` only when `next === "exit"`. The repository already no-ops a duplicate spawn.
- **FeedbackCard vs in-scene deltas.** Coin movements still go through FeedbackCard: scene coins after the option that credited them (or combined with the +10 on the same exit), and the task-reward sheet on TaskResult when `claimTaskReward` returns > 0. Meter-only effects render on the verdict panel (icon + signed number) and change the pet pose; they do not need a second sheet. Cause / next-step copy for `task_reward` and `task_scene` lives in the strings module (M3 already allowed a raw-key fallback until this milestone).
- **TaskRun presentation.** Intro from content stays visible as scene context. After a tap: verdict banner (icon + kid word, never color alone) + explanation + «Дальше». Suggested words (no shame): good «Верно», warn «Есть цена», bad «Попробуй ещё». Pose during the explanation: happy on good, idle on warn, sad on bad; after «Дальше», pose follows current meters again. Back from TaskRun abandons the in-memory node pointer without extra writes (already-applied step effects stay — they are real decisions).
- **Task list derivation.** Unlocked ids come from existing `unlockedTasks(content.tasks, dayN, isDemo)`. Progress rows come from a new read `listTaskProgress(profileId)` (`taskKey`, `status`, `rewardPaid`). A topic card is locked when its id is not in the unlocked list; completed when status is completed; correction cards render only when a progress row exists. Do not show correction tasks in the six topic slots.
- **«Закончить день» now calls `closeDay`.** Replace the M3 placeholder copy. Still require a confirmed plan first. Pass the catalog already loaded in session content. Navigate to Итоги дня with the returned summary (do not recompute stages in the UI).
- **Day-summary read model** (needed because Progress Итоги must re-read after the fact). `closeDay` should return this shape (and persist enough that `lastClosedDay(profileId)` can reload it). Decision-rich fields:

```ts
type DaySummaryView = {
  dayId: string;
  n: number;
  score: number;
  facts: { mandatoryCovered: boolean; withinPlan: boolean; deposited: boolean };
  plan: { mandatory: number; optional: number; savings: number };
  actual: { mandatory: number; optional: number; savings: number };
  meterDeltas: { care: number; mood: number };
  stage: "novice" | "friend" | "master";
  previousStage: "novice" | "friend" | "master";
  stageExplanation: string | null;
};
```

Score icons map to `facts` (+2 / +1 / +1). Meter reason lines: skipped mandatory → Забота −15 copy; optional spend > plan bucket → Настроение −5 copy; otherwise a calm «без изменений» line. Stage banner only when `stageExplanation` is non-null. Kid explanations stay the strings already returned by the engine (`explainStageChange`).
- **Blocked next day in normal play.** `openDay` already returns `{ status: "blocked" }` before local midnight. Main must handle that: keep showing the last closed day's hub via an extended day read that works when no day is open (`open: boolean` on the existing day state, last `n` / `dayId` preserved). Banner «Новый день откроется завтра»; disable План / Магазин / Копилка with explanation; keep Задания and Прогресс (Словарик) enabled; hide or disable «Закончить день». Writes still require an open day in the repository — the hub gate is the UI guarantee.
- **Демо-режим cadence uses the existing `isDemo` unlock branch (ADR-0002), not a live ManualClock swap.** `nextDayUnlocked` already returns true when `isDemo` is set, so `closeDay` then `openDay` is enough for back-to-back days. Live session keeps SystemClock. ManualClock remains the test double. Do not recreate the repository on demo enter.
- **Thin demo panel, not AdultGate.** Replace the Взрослый раздел stub with a panel: toggle on (confirm sheet) / off (exit), «Сбросить демо». No multiplication question, no Удалить профиль, no Родительский бонус, no positive-wording progress overview — those are M5. Confirm copy: «Демо создаёт отдельный тестовый профиль».
- **Demo profile operations compose existing writes** (session-level, one place):
  - Enter: remember the current child id in meta (`childProfileId`) if missing; create a demo profile once (`isDemo: true`, names «Демо», default `sp1/c1/a1`, same goals seed as first run); set `activeProfileId` to it; land on Main (skip Первый запуск and Стартовый бюджет — `createProfile` already granted 100).
  - Exit: set `activeProfileId` back to `childProfileId`; leave the demo row in place.
  - Reset: `deleteProfile(demoId)` then `createProfile` with the same demo defaults; stay on the new demo id.
  Demo Main shows «Демо: дни идут подряд». Итоги дня primary is «Следующий день», which pops to Main so `openDay` credits Пособие.
- **Progress Итоги.** Replace the M3 empty-state when `lastClosedDay` is non-null. Also show overall: closed-day count, completed non-correction tasks x/6, achieved goals count. Журнал labels: `task_reward:*` → «Задание: {title}»; `task_scene` → «Задание» (scene coins). Keep Словарик as it is.
- **Navigation.** Register TaskList, TaskRun (task id param), TaskResult, DaySummary, Demo. Remove the tasks stub destination; Adult stub becomes Demo. Back from list/run/result/summary/demo returns without traps. Shop BlockedSheet «Выполнить задание» navigates to TaskList.
- **Chrome.** Existing kit (Screen, Card, PrimaryButton, TextButton, Chip, Badge, BackButton, PetView, FeedbackCard, MeterBar). Option buttons and «Дальше» / «Играть» / day-close sit in a footer. New copy only in the strings module, CONTEXT.md terms.
- **Accessibility / UX minimum.** Targets ≥48 dp, body ≥16 sp, verdicts as icon+word, RU copy. Animations toggle and the full UX checklist stay M6.
- **Hub refresh.** After TaskResult, day close, demo switch/reset/exit, Main reloads on focus as it already does. Unlock list must use `profile.isDemo` and the current day `n` (last closed `n` while waiting).

## Testing Decisions

- **What makes a good test:** assert what a child or adult can see and do — screens, copy, enabled/disabled controls, navigation, rewards, badges, day `n`, Этап, and whether the child profile was left alone — never styles, sheet animation, or provider internals. Prefer `getByRole` / accessible name, `userEvent`, async `render` + `screen` (RNTL v14). Query visible RU text; `testID` last. Do not re-test M1 invariants (reward math, rolling stage window, `isDemo` unlock, balance == Σ transactions) in UI tests; those stay in the core/repository suites. If a UI test needs state, the fake records calls and returns a fixture. New reads (`listTaskProgress`, `lastClosedDay`, `open` on day state) get thin tests in the existing node suite: public read shape only. Expand `closeDay`'s returned summary in that same suite, not in RNTL.
- **Seams (fewest, highest, existing preferred):**
  1. **Navigation-root RNTL seam (primary, automated).** Render `FinPetApp` with fake game-repository and meta-repository adapters at the existing session-ports seam. Two flows in one or two sibling files beat a file per screen:
     - **Задания:** seed a returning child → open list → only «Первый план» unlocked → play a good path through nodes (verdict + explanation, no reward on retry) → TaskResult +10 and FeedbackCard → replay pays 0 → backpack bad option spawns «Почини рюкзак» and the list shows it → Shop BlockedSheet «Выполнить задание» lands on the real list (update the M3 economy-flow assertion that still expects the stub).
     - **Day close + demo:** confirm a plan → «Закончить день» → Итоги дня shows score / plan-vs-actual / meters → «Ждём завтра!» → Main banner, economy tiles disabled, Задания still opens. Enter Демо-режим (confirm sheet) → all six tasks unlocked → close and «Следующий день» five times (plan-confirm + close is enough; fake may pre-confirm) → day `n` is 5 and Пособие credited each open → «Сбросить демо» returns demo to day 1 / Новичок / grant-only journal → exit → child profile still on its closed day with original Баланс and task progress.
  2. **Device acceptance seam (AC).** Appendix A steps 6 and 10 on an Android device/emulator; five consecutive demo days back-to-back; reset restores demo; exit leaves the child profile; normal profile still waits until tomorrow; airplane mode. This is the only place the milestone AC can be proven, matching M0–M3's device seam.
- **Prior art:** `src/ui/__tests__/economyFlow.test.tsx` and `firstRunFlow.test.tsx` (RNTL `await render` + `screen` + `userEvent` + fake ports). Extend that style; keep first-run and economy coverage green. Fake ports must implement the new SessionGame methods with enough fidelity for those assertions (task progress, closeDay summary, `openDay` blocked for non-demo after close, demo create/reset/exit, scene coins). Core `tasks.test.ts` already covers unlock/retry/reward-due — do not duplicate it at the UI seam.

## Out of Scope

- AdultGate arithmetic, Взрослый раздел progress overview, «Сбросить прогресс», Удалить профиль typed confirm — M5.
- Kill-and-relaunch as a milestone AC and the full Appendix A 1–12 pass — M5 (writes still go to SQLite immediately, as they already do).
- Accessibility hardening pass, permission audit, perf re-measure — M6.
- Родительский бонус, Помощник, unexpected medical event, landscape — stretch.
- Changing grant amounts, catalog prices, meter formulas, task scripts, or schema shape.
- Swapping SystemClock for ManualClock in the live app; adding new content JSON files.
- Этап visual fake beyond what Main already does (scale/glow polish is not this milestone).

## Further Notes

- Milestone AC (ROADMAP §7 M4): Appendix A step 10; **5 consecutive demo days** playable back-to-back; reset restores initial demo state; normal profile still real-day-gated. Interpret step 6 as in-scope here (M3 explicitly left it a stub).
- M1 comment: `applyTaskStep` + `claimTaskReward(..., correct)` are the persistence seam; `payments_two_prices` N1 good path already goes to N2 so the second node is reachable.
- M3 comment: «Закончить день» must not keep the placeholder; Итоги tab empty-state is only until the first close.
- Starting meters 50/50; a scored first close (+2/+1/+1 = 4) moves Новичок → Друг and should show the engine's Друг explanation — useful in the demo walkthrough.
- Default demo appearance is the same complete default as Первый запуск (`sp1/c1/a1`).
- Vocabulary: Задание, Демо-режим, Игровой день, Итоги дня, Этап, Забота, Настроение, Пособие, Баланс, Монеты, Профиль ребёнка, Словарик. Avoid: урок, квест, тест, тестовый аккаунт, отладка, уровень, эволюция, отчёт.
- Device Appendix A remains the same class of follow-up as M0–M3 when Android SDK is missing; do not skip the automated navigation-root tests.

## Comments
