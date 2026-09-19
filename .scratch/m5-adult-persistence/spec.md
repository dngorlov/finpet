# M5 — Взрослый раздел + persistence

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 M5, §4.2 screens #12–13, §2.4, §4.3 demo walkthrough / persistence · `docs/REQUIREMENTS.md` Appendix A 11–12, R11–R13 · `CONTEXT.md` · ADR-0002 · M4 comments

## Problem Statement

A juror can already enter Демо-режим from Main, but there is no arithmetic gate, no adult-facing learning progress, and no production path to Сбросить прогресс or Удалить профиль (only a __DEV__ Settings shortcut). Kill-and-relaunch is not an M5 acceptance check yet. Appendix A steps 11–12 and the full 1–12 device pass are not closed.

## Solution

Put an AdultGate in front of the existing Демо-режим panel and turn that panel into Взрослый раздел. Every visit asks a random two-digit × one-digit question; a wrong answer after two attempts becomes a new question; a correct answer opens Adult. Adult shows learning progress in positive wording, keeps the M4 demo toggle / «Сбросить демо» / exit, and adds typed extra confirmations for «Сбросить прогресс» (keep names and appearance, restore initial child state) and «Удалить профиль» (child and demo gone, Первый запуск). SQLite already writes through; this milestone proves relaunch routing at the navigation-root seam and on a device. Existing demo operations stay the only demo write path.

## User Stories

1. As an adult who taps Взрослый раздел, I want a multiplication question before any adult controls, so that a ребёнок cannot change Демо-режим or delete a profile by accident.
2. As an adult on AdultGate, I want the prompt «Сколько будет 14 × 7?» with a numeric field and «Войти», so that the barrier matches ROADMAP §4.2 #12.
3. As an adult, I want each question to be a random two-digit × one-digit product (tens 10–99, ones 2–9), so that it is easy for an adult and not a stored PIN.
4. As an adult who types the wrong product, I want no hint and another try on the same question, so that a slip is not immediately a new puzzle.
5. As an adult who is wrong twice, I want a new question, so that guessing is not rewarded.
6. As an adult who types the correct product, I want Adult to open, so that I can see progress and demo controls.
7. As an adult who uses Назад or Android Back on the gate, I want to return to Main with no unlock stored, so that leaving is safe.
8. As an adult who leaves Adult and taps Взрослый раздел again, I want a new gate question, so that the barrier is asked on every entry and never written to SQLite.
9. As an adult on Adult, I want a short progress overview in positive wording: topics Бюджет / Копилки / Платежи and overall days played plus Задания done x/6, so that I can see learning without judging the child.
10. As an adult, I want a topic to count as done only when both of its non-correction Задания are completed, so that «тема сделана» means the pair is finished.
11. As an adult when a topic is unfinished, I want copy like «ещё впереди» or «одно задание сделано», never «не сдан» or a score, so that there is no negative evaluation.
12. As an adult when no Игровой день has closed, I want a calm empty line rather than a blank card, so that a new profile is not a dead end.
13. As an adult, I want the existing Демо-режим chip, confirm sheet, exit, and «Сбросить демо» to keep working behind the gate, so that M4's demo AC still holds.
14. As an adult who confirms Демо-режим, I want the dedicated `isDemo` profile and Main banner unchanged from M4, so that five back-to-back days remain possible.
15. As an adult who exits demo, I want the child's Баланс, purchases, Копилка, Цель, Этап, and task progress untouched, so that demo never mutates the real profile.
16. As an adult on the child's profile, I want «Сбросить прогресс» visible, so that a jury can restart the child's economy without deleting identity.
17. As an adult who chooses «Сбросить прогресс», I want a first confirm sheet, then a field that accepts exactly «сбросить», so that a single tap cannot wipe a day.
18. As an adult who types «сбросить» and confirms, I want the child's names, Вид, Окрас, and Аксессуар kept, and the economy restored to initial state (day 1, Новичок, meters 50/50, empty Журнал except Стартовый бюджет until the next Пособие, unpaid tasks, default active Цель), so that identity survives a reset.
19. As an adult after that reset, I want to land on Main (not Первый запуск, not Стартовый бюджет), so that onboarding is not replayed.
20. As an adult on the child's profile, I want «Удалить профиль» visible, so that Appendix A step 12 can take the pet off the device.
21. As an adult who chooses «Удалить профиль», I want a first confirm sheet, then a field that accepts exactly «удалить», so that delete is a typed action.
22. As an adult who types «удалить» and confirms, I want the child's profile and any demo profile removed, profile meta cleared, and Первый запуск shown, so that the device is empty of pets.
23. As an adult who force-quits after that delete, I want the next launch to stay on Первый запуск, so that no ghost profile remains.
24. As an adult while Демо-режим is active, I want child «Сбросить прогресс» and «Удалить профиль» hidden, so that demo controls cannot be confused with wiping the child.
25. As a разработчик in __DEV__, I want Settings to keep its Dev delete shortcut, so that local resets stay one tap during development.
26. As a ребёнок in production Settings, I want no Удалить профиль control, so that delete only lives behind AdultGate.
27. As a ребёнок after play, I want a kill and relaunch to open Main with the same profile, Баланс, purchases, Копилка, Цель, and task progress, so that Appendix A step 11 holds.
28. As a ребёнок after «Сбросить прогресс», I want a relaunch to open Main on the reset child (grant-level Баланс, names intact), so that reset is persisted.
29. As a ребёнок, I want every adult-facing string in Russian, short, and without shaming, so that even this screen stays in the 7–11 register when a child glances at it.
30. As a ребёнок, I want gate and Adult targets ≥48×48 dp and body ≥16 sp, so that Войти, typed confirm, and Back stay tappable.
31. As a ребёнок, I want the app to stay fully offline with no new permissions, so that AdultGate never needs a network.
32. As a hackathon judge, I want Appendix A step 11 (close and relaunch, progress saved) and step 12 (AdultGate, then reset/delete) passable, so that R12 and R13 close.
33. As a hackathon judge, I want the full Appendix A 1–12 loop playable twice in a row on a physical device, so that M5's milestone AC holds.
34. As a разработчик, I want AdultGate to be a small pure question helper plus a screen, so that tests can parse the visible product instead of injecting a random port.
35. As a разработчик, I want reset and delete to compose existing `createProfile` / `deleteProfile` and meta keys, so that M1 remains the only write path.
36. As a разработчик, I want chrome strings in the centralized strings module using CONTEXT.md terms, so that «родительский контроль», «сброс приложения», or «тестовый аккаунт» never leak.
37. As an accessibility reviewer, I want the gate field, Войти, and typed-confirm fields exposed with accessible names, so that tests and TalkBack share labels.

## Implementation Decisions

- **No new persistence port.** SQLite already writes every mutation. Do not add a save/load API, a second database, or a live ManualClock swap (ADR-0002 / M4: demo cadence is `isDemo` unlock; live session keeps SystemClock).
- **Gate on every entry, not stored.** «Session-scoped» means the correct answer is never written to meta or SQLite. Each navigation from Main to Взрослый раздел shows AdultGate again. Back from the gate does not unlock.
- **AdultGate presentation.** Prompt `Сколько будет {a} × {b}?` (multiplication sign `×`). Numeric `TextInput` with accessible name matching the prompt's short label (e.g. «Ответ»). Primary «Войти». No hints. Chrome: Screen, BackButton, PrimaryButton, existing type scale.
- **Question helper (pure).** `makeQuestion(random = Math.random): { a: number; b: number }` with `a` in 10–99 and `b` in 2–9. `product(q) = a * b`. Screen holds `attempts` (0–2); first wrong stays on the same `{a,b}`; second wrong calls `makeQuestion` again and resets attempts. Do not add an RNG port to `SessionPorts`.
- **Navigation.** Register `AdultGate`. After a correct answer, `replace` to the existing Demo route (keep the M4 screen/file; do not duplicate the panel). Main's Взрослый раздел tile goes to `AdultGate`, not `Demo`. Back from Adult (today's Demo screen) returns to Main without traps. Existing demo enter/reset/exit still `reset` the stack to Main.
- **Adult progress overview.** Derive only from existing reads: `listTaskProgress`, `lastClosedDay`, content task topics. Non-correction tasks grouped by `topic` (`budget` / `savings` / `payments`). A topic is complete when both of its tasks have `status === "completed"`. Suggested copy (positive only): complete «оба задания сделаны»; one done «одно задание сделано»; none «ещё впереди». Overall: days played from `lastClosedDay.n` or «Игровых дней пока нет — это нормально.»; Задания `done/6` among non-correction tasks. Do not show day score, skipped-mandatory reasons, or «не сдан».
- **Destructive child actions compose existing writes** (session-level, one place, next to `demoMode.ts`):
  - **Сбросить прогресс:** only when the active profile is the child (`!isDemo`). Read appearance + names; `deleteProfile(childId)`; `createProfile` with the same identity, `isDemo: false`, same goals seed as first run; set `activeProfileId` / `childProfileId` to the new id; keep `onboardingDone`; `reset` to Main (Main's existing `openDay` credits Пособие). Skip Первый запуск and Стартовый бюджет.
  - **Удалить профиль:** only when the active profile is the child. `deleteProfile` the child; if a demo id exists and the row is present, `deleteProfile` it too; `remove` `activeProfileId`, `childProfileId`, `demoProfileId`, `onboardingDone`; `reset` to FirstRun.
  - While `isDemo`, hide those two actions; keep demo toggle + «Сбросить демо».
- **Typed extra confirmation.** First sheet explains the action; primary on that sheet reveals a field. Primary that performs the write stays disabled until the trimmed value equals `сбросить` or `удалить` (exact, lowercase). Cancel/close dismisses without writes. Reuse Modal/sheet patterns already on the demo panel.
- **Settings.** Leave `__DEV__` DevSettings as-is. Do not add production delete there.
- **Chrome / copy.** New strings only in the strings module. Vocabulary: Взрослый раздел, Демо-режим, Удалить профиль, Профиль ребёнка, Задание, Игровой день, Баланс. Avoid: родительский контроль, сброс приложения, тестовый аккаунт, PIN, пароль.
- **Accessibility / UX minimum.** Targets ≥48 dp, body ≥16 sp, numeric keyboard on the gate. Animations toggle and the full UX checklist stay M6.
- **Hub refresh.** After demo switch/reset/exit and after Сбросить прогресс, Main reloads on focus as it already does.

## Testing Decisions

- **What makes a good test:** assert what an adult or child can see and do — gate prompt, enabled/disabled Войти and typed confirm, Adult overview copy, whether demo/child profiles were left alone, and where launch lands after remount — never styles, sheet animation, RNG internals, or provider internals. Prefer `getByRole` / accessible name, `userEvent`, async `render` + `screen` (RNTL v14, `node_modules/@testing-library/react-native/docs/guides/llm-guidelines.md`). Query visible RU text; `testID` last. Do not re-test M1 invariants or M4 demo cadence math in UI tests.
- **Seams (fewest, highest, existing preferred):**
  1. **Navigation-root RNTL seam (primary, automated).** Render `FinPetApp` with fake game/meta adapters. Parse the visible `Сколько будет N × M?`, type the product, proceed. Shared helper `passAdultGate` lives next to `confirmTinyPlan` so M4 files stay green. Cover: wrong twice → new question; correct → Adult; Back from gate → Main and re-entry still gated; Adult positive topic/overall lines; demo enter/reset/exit still work behind the gate; typed «сбросить» restores child identity and grant-level economy on Main; typed «удалить» → Первый запуск; remount with the same fakes after play still Main with intact Баланс / purchases / Копилка / Цель / task progress; remount after delete still Первый запуск. While demo is active, child destructive actions are absent.
  2. **Device acceptance seam (AC).** Appendix A steps 11–12 and a full 1–12 pass twice on a physical device, including a real process kill between 11 and relaunch. This is the only place the milestone AC can be proven, matching M0–M4.
- **Prior art:** `src/ui/__tests__/demoFlow.test.tsx` and `firstRunFlow.test.tsx` (RNTL `await render` + `screen` + `userEvent` + fake ports). Extend that style; keep first-run, economy, tasks, and demo coverage green by routing those Adult entries through `passAdultGate`. Pure `makeQuestion` / `product` get a tiny node or jest test beside the helper — no new SessionPorts method. Question generation bounds (10–99 × 2–9) are asserted there; the UI test only parses whatever is on screen.

## Out of Scope

- Accessibility hardening pass, permission audit, airplane-mode re-audit, perf re-measure — M6.
- Родительский бонус, Помощник, unexpected medical event, landscape — stretch.
- Animations toggle on Settings — M6.
- Changing grant amounts, catalog prices, meter formulas, task scripts, or schema shape.
- Swapping SystemClock for ManualClock in the live app.
- Filling `docs/test-cases.md` / `docs/test-report.md` (M6/M7).
- Removing the __DEV__ Settings delete shortcut.

## Further Notes

- Milestone AC (ROADMAP §7 M5): Appendix A steps 11–12; **full Appendix A pass (1–12) on a physical device**, twice in a row.
- M4 comment: AdultGate, positive-wording overview, «Сбросить прогресс», Удалить профиль typed confirm, and kill-and-relaunch as a milestone AC were deferred here. The thin demo panel is the starting Adult surface.
- ROADMAP §4.2 #12 «after 2 attempts» wins over §2.4's immediate new-question wording.
- Device Appendix A remains the same class of follow-up as M0–M4 when Android SDK is missing; do not skip the automated navigation-root tests.
- Vocabulary: Взрослый раздел, Удалить профиль, Демо-режим, Профиль ребёнка, Задание, Игровой день. Avoid: родительский контроль, сброс приложения, clear storage, тестовый аккаунт, PIN.

## Comments
