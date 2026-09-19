# M2 — Первый запуск, pet, hub

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 M2, §4.2 screens #1–4, §2.2/§2.5, §5.4 · `docs/REQUIREMENTS.md` Appendix A 1–4, R1–R4 · `CONTEXT.md` · ADR-0001 · ADR-0002 · M0/M1 comments

## Problem Statement

A child who installs ФинПет still lands on an empty placeholder Main screen. They cannot meet the Питомец, pick how it looks, receive the Стартовый бюджет, or see Баланс / Забота / Настроение / Цель on the hub. Appendix A steps 1–4 (first launch, local Профиль ребёнка, pet customization, starting budget plus current Цель and available Задание) are not playable on a device, so later economy and task screens have nothing to hang off.

## Solution

Ship the first-run path and the Main hub exactly as ROADMAP §4.2 #1–4, plus Словарик with «Как играть» replay. Первый запуск is a single controlled journey: customize the pet, enter the child and pet names, then let that named pet explain the game in three skippable first-person speech bubbles. The choices remain an in-memory draft until the explanation is finished or skipped; only then is the Профиль ребёнка written. The Стартовый бюджет screen explains the +100 Монет grant. Returning launches skip Первый запуск and land on Main. Main shows the Питомец (Вид + Окрас + Аксессуар, pose from meters), Этап, meters, coin badges, active Цель, the day's unlocked Задание, a 2×3 nav grid, and a highlighted prompt to compose a План. Словарик lists the ten glossary terms and can replay «Как играть» without writing profile data. Destinations that belong to later milestones are reachable stubs with a next-step explanation — never a dead end.

## User Stories

1. As a ребёнок on first launch, I want to customize my Питомец before reading rules, so that the explanation comes from a creature that already feels like mine.
2. As a ребёнок, I want a complete default pet plus three Вид, Окрас, and Аксессуар choices (27 combinations), so that keeping the default or changing it are both valid.
3. As a ребёнок, I want a live preview that updates as I customize, so that I see the result before continuing.
4. As a ребёнок, I want naming to be a separate next phase, so that appearance comes before identity and rules.
5. As a ребёнок, I want to enter «Как тебя зовут в игре?» and «Как зовут питомца?» using 1–20 visible characters after trimming, so that the Профиль ребёнка has usable names without collecting personal data.
6. As a ребёнок, I want no profile row written while I customize, name, or browse «Как играть», so that backing out leaves no partial profile.
7. As a ребёнок, I want my customized, named pet visible on every «Как играть» step, so that the guidance feels connected to my choices.
8. As a ребёнок, I want the pet to speak three short first-person bubbles — decisions affect it, Три решения, then plan/spend/save/review — so that the rules are brief and concrete.
9. As a ребёнок, I want passive progress text and dots that do not look or act like buttons, so that I know where I am without false controls.
10. As a ребёнок, I want «Дальше» on intermediate steps, «Играть!» on the last step, and a quiet «Пропустить» on every rule step, so that actions describe what happens next.
11. As a ребёнок, I want visible and Android Back to preserve my draft while moving to the previous phase or rule, so that correcting a choice does not erase work.
12. As a ребёнок who force-quits before the profile is created, I want the next launch to restart at pet customization, so that a half-finished setup is not sticky.
13. As a ребёнок who finishes or skips «Как играть», I want the profile created atomically before Стартовый бюджет; if creation fails, I want my draft retained with a retry, so that I never enter the game without a valid profile.
14. As a ребёнок on that screen, I want a short kid-worded line that this is my budget to plan, save, and care with, then «Понятно», so that I know what the coins are for.
15. As a ребёнок, I want that grant to happen exactly once (the +100 already recorded when the profile is created), so that I cannot farm the Стартовый бюджет by reopening the screen.
16. As a ребёнок who force-quits on the Стартовый бюджет screen, I want the next launch to open Main with the 100 already in Баланс, so that I am not asked to explain the grant twice.
17. As a ребёнок arriving on Main the first time, I want Игровой день 1 to open and Пособие +10 to be credited, so that the hub shows a real day with funds to plan.
18. As a ребёнок, I want a Пособие ribbon when that credit just happened, so that the extra ten Монет have a visible source.
19. As a returning ребёнок, I want launch to skip Первый запуск and open Main, so that I can keep playing immediately.
20. As a ребёнок on Main, I want to see my Питомец with the chosen Вид, Окрас, and Аксессуар layered on the pose that matches current Забота and Настроение, so that appearance and mood are visible at a glance.
21. As a ребёнок, I want an Этап badge showing Новичок / Друг / Мастер as icon + word (never color alone), so that I know how far the Питомец has come.
22. As a ребёнок, I want Забота and Настроение as icon + bar + number on a 0–100 scale, so that status is readable without relying on color.
23. As a ребёнок, I want a Баланс badge showing current Монеты, so that I know what I can spend right now.
24. As a ребёнок, I want a Копилка badge with mini progress toward the active Цель, so that saving is visible on the hub.
25. As a ребёнок, I want an active-Цель card with name, accumulated / cost, and remaining, so that Appendix A step 4 shows a current goal (default Скейтборд).
26. As a ребёнок, I want an active-Задание card with the day's unlocked title (day 1: «Первый план») and an «Играть» action, so that available tasks are visible even before the runner exists.
27. As a ребёнок who taps «Играть» in M2, I want a stub that explains Задания will be playable soon and a way back, so that there is no dead end.
28. As a ребёнок whose План is not confirmed, I want the План tile highlighted with «Составь план дня», so that I know the next required action.
29. As a ребёнок who taps «Закончить день» before a confirmed План, I want a prompt to compose the plan first, so that I cannot close a day that never started properly.
30. As a ребёнок, I want a 2×3 nav grid of План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел with targets ≥48×48 dp, so that every later screen is already reachable in ≤2 taps.
31. As a ребёнок who opens План, Магазин, Копилка, Задания, or Взрослый раздел in M2, I want a short «скоро» explanation and a back path, so that unfinished destinations never trap me.
32. As a ребёнок, I want Прогресс to open Словарик, so that help is available from the hub in this milestone.
33. As a ребёнок in Словарик, I want the ten terms (Баланс, Копилка, Цель, Пособие, Обязательные расходы, Желаемые расходы, Забота, Настроение, Этап, Игровой день) as accordion rows with kid definitions from content, so that complex words are explained in-app.
34. As a ребёнок, I want «Как играть» in Словарик to replay the pet's three speech bubbles with «Готово» / «Закрыть» and then return to Словарик without profile writes, so that the explanation is never one-shot.
35. As a ребёнок, I want a ⚙ control on Main that opens a Settings stub with app name and version/build, so that the gear is not a dead end.
36. As a ребёнок, I want every user-facing string in Russian, short, and without shaming, so that the 7–11 register holds.
37. As a ребёнок, I want body text ≥16 sp and no verdict or status communicated by color alone, so that the hub stays readable.
38. As a ребёнок, I want placeholder pet art to still show a layered Питомец, so that a late designer drop is a file swap rather than a blocked milestone.
39. As a ребёнок, I want Вид / Окрас / Аксессуар keys persisted as `sp1|sp2|sp3`, `c1|c2|c3`, `a1|a2|a3`, so that real display names can land later without a schema change.
40. As a ребёнок, I want the app to stay fully offline with no new permissions, so that first-run works in airplane mode.
41. As a ребёнок, I want visual response to taps within 1 s, so that pickers, navigation, and «Играть!» feel immediate.
42. As a hackathon judge, I want Appendix A steps 1–4 passable end-to-end on a device, so that M2's acceptance criterion is demonstrable.
43. As a returning ребёнок, I want profile, pet appearance, names, Баланс (100 + Пособие), meters, Этап, and the default Цель intact after kill-and-relaunch, so that the hub is already persistent.
44. As a разработчик, I want the pet's speech and glossary text to come from the versioned content files, so that wording changes do not touch screen logic.
45. As a разработчик, I want chrome strings (buttons, field labels, stub copy) in the centralized strings module using CONTEXT.md terms, so that synonyms like «аккаунт» or «здоровье» never leak into the UI.
46. As a разработчик, I want screens to talk to the existing game and meta repositories rather than a new persistence layer, so that M1 invariants stay the only write path.
47. As a разработчик, I want first-run routing to wait until the database has booted and meta is readable, so that the app never flashes Main before it knows whether a Профиль ребёнка exists.
48. As an accessibility reviewer, I want pickers, nav tiles, and primary buttons exposed as buttons with accessible names, and each speech step announced once as «Питомец [имя] говорит: …», so that tests and TalkBack share the same labels without duplicate pet descriptions.

## Implementation Decisions

- **Reuse M1 writes; do not invent a second economy path.** Profile creation calls the existing game-repository `createProfile` (which already grants the Стартовый бюджет of 100 as a `starting_grant` transaction, seeds all three Цели, marks one active, and initializes Забота/Настроение at 50 and Этап Новичок). The Стартовый бюджет screen is explanation only — it must not credit again. First Main visit calls existing `openDay`, which credits Пособие +10 once.
- **Default active Цель** is the first content goal (Скейтборд, cost 90). Switching Цели is M3 Копилка work; M2 only displays the active one.
- **Extend the existing profile read**, not a new module: `getProfile` must also return Вид, Окрас, Аксессуар, and pet name so PetView can render. Hub also uses existing `savingsState` plus `unlockedTasks` from the domain core (day 1, not demo → «Первый план»). Do not add a parallel snapshot store.
- **FirstRun owns one in-memory draft.** It is a small state machine with separate Питомец, Имена, and «Как играть» phase components, not three independently persisted screens. A complete default appearance is valid. Names are trimmed and must each contain 1–20 visible characters. Back mutates only the phase/card index; leaving or force-quitting before creation discards the draft.
- **Profile creation is the commit boundary.** Finishing the third speech bubble or pressing «Пропустить» calls the existing game-repository `createProfile`, then sets `activeProfileId` / `onboardingDone`, then navigates to StartingBudget. A failed write keeps the draft and current step for retry; navigation never advances on failure.
- **Meta keys** already reserved: `onboardingDone`, `activeProfileId`. First run is selected when there is no `activeProfileId`. Do not persist a separate draft or «starting budget seen» flag: if a profile exists, skip the grant screen on later launches.
- **Session bootstrap lives in the UI layer** and is the only place that decides FirstRun vs StartingBudget vs Main. It waits for database boot, then reads meta. Screens receive repositories through a provider so jest-expo tests can inject fakes (the better-sqlite3 driver cannot load under the RN jest project).
- **Navigation:** native stack already in M0. Register FirstRun, StartingBudget, Main, Glossary (Словарик), Settings, and one shared stub screen for not-yet-built destinations. Main is the hub; back from stubs/glossary/settings returns to Main. «Как играть» replay reuses only the explanation phase with the existing profile's pet and exits back to Словарик without creating or changing a profile.
- **Rule presentation:** `hint.json` keeps its existing `title` / `body` schema; `body` becomes the pet's first-person speech and `title` is not rendered. Each step has one bubble, the pet's idle pose, no required animation or audio, passive dots, and «Шаг N из 3». The pet is a scripted narrator here, never a replacement for Помощник.
- **PetView** layers placeholder (or real) PNGs per ROADMAP §5.4: base `sp{n}/c{n}/{idle|happy|sad}.png` plus overlay `a{n}.png`. Pose rule (not settled in the roadmap; chosen here): **sad** if Забота < 30 or Настроение < 30; **happy** if both ≥ 70; otherwise **idle**. Fresh profile (50/50) is idle. Этап visual fake (scale/glow) can be a light tint/scale on the same view; do not block on real art.
- **Placeholder picker labels** live in the strings module until the designer names arrive: «Вид 1/2/3», «Окрас 1/2/3», «Аксессуар 1/2/3». Keys stored are the contract keys, never the labels.
- **Словарик** is opened from the Прогресс tile this milestone. Итоги and Журнал tabs wait for M3/M5. Terms and hint cards are loaded via the existing content loader.
- **Generic FeedbackCard is M3.** Стартовый бюджет is the dedicated grant explanation; Пособие uses the Main ribbon. Do not build the bottom-sheet FeedbackCard now.
- **«Играть» on the task card** does not start the node runner (M4). It opens the same class of stub as other unfinished destinations.
- **«Закончить день»** does not close the day in M2 (no Итоги дня screen). It only prompts to confirm a План first.
- **Accessibility / UX minimum for this milestone:** touch targets ≥48 dp, body ≥16 sp, meters and Этап as icon+text, RU copy from CONTEXT.md. Animations toggle, font-scale audit, and the full UX checklist stay M6. Destructive confirmations are N/A (no reset UI here).
- **App.tsx today fires boot in a fire-and-forget effect.** M2 must not route until boot finishes; a short in-app wait state is fine and counts toward the ≤5 s launch budget (no extra I/O beyond the existing DB open).

## Testing Decisions

- **What makes a good test:** assert what a child can see and do — screens, copy, enabled/disabled controls, navigation, and the numbers the hub displays — never styles, layout math, or provider internals. Prefer `getByRole` / accessible name, `userEvent`, async `render` + `screen` (RNTL v14). Query visible RU text; `testID` last. Do not re-test M1 invariants (balance == Σ transactions, grant math) in UI tests; those stay in the data project's repository suite. If a UI test needs a profile, the fake repository records `createProfile` / `openDay` calls and returns a fixture hub state.
- **Seams (fewest, highest, existing preferred):**
  1. **Navigation-root RNTL seam (primary, automated).** Render the app tree with fake game-repository and meta-repository adapters injected at the existing persistence seam (two adapters, one seam — expo-sqlite in the app, in-memory fakes in jest-expo). Drive Appendix A 1–4 with `userEvent`: first launch → customize 3×3×3 pet (preview reacts) → «Дальше» → enter both names → «Дальше» → pet speaks three rules with passive progress → finish or skip and assert exactly one profile write → Стартовый бюджет 100 explained → Main shows pet, Новичок, meters 50/50, Баланс 110 after day open, Копилка 0, Цель Скейтборд 0/90, Задание «Первый план», plan hint. Cover Back retaining the draft, no write before completion, failed creation retaining the draft, force-quit/re-render restarting at customization, Прогресс → ten terms + «Как играть» replay with no profile write, and returning launch with `activeProfileId` skipping FirstRun. One flow test is worth more than a file per phase.
  2. **Device acceptance seam (AC).** Appendix A steps 1–4 on an Android device/emulator: pet customization, names, pet-spoken «Как играть», local profile creation, Стартовый бюджет, Main with goal and available task. Verify passive indicators do not look tappable, Android Back preserves the draft, and the flow works in airplane mode. This is the only place the milestone AC can be proven, matching M0's device seam.
- **Prior art:** `src/ui/__tests__/MainScreen.test.tsx` (RNTL `await render` + `screen` + RU text); M0 named this as the pattern M2 screen tests copy. Do not put UI tests in the node/better-sqlite3 project.

## Out of Scope

- План (buckets, confirm, plan-vs-actual), Магазин, Копилка transfers/withdrawal/goal switch, Журнал, generic FeedbackCard — M3.
- TaskRun / TaskResult, unlock-per-day UI beyond showing the card, Итоги дня, Демо-режим profile and ManualClock controls — M4.
- AdultGate, Взрослый раздел contents, reset/delete, persistence report as a separate milestone AC — M5 (kill-and-relaunch of the hub is in scope above, but Appendix A 11–12 are not).
- Accessibility hardening pass, permission audit, perf re-measure — M6.
- Real designer names/art, launcher icon, sounds, Помощник, Родительский бонус, landscape — stretch / team.
- Changing grant amounts, meter formulas, or schema shape.

## Further Notes

- Milestone AC (ROADMAP §7 M2): Appendix A steps 1–4 passable end-to-end on device.
- M1 comment: starting meters 50/50 live in core config; goal-achievement mood bonus is unused until M3.
- `getProfile` today omits appearance fields — filling that gap is required for PetView and is not a new seam.
- Placeholder pet PNGs follow §5.4; regenerate via the existing script if missing from a checkout.
- M0 device AC (release APK on API 26, ≤5 s, permission dump) is still blocked on machines without Android SDK; M2's device seam is the same class of follow-up, not a reason to skip the automated navigation-root tests.
- Vocabulary: Профиль ребёнка, Питомец, Вид, Стартовый бюджет, Монеты, Баланс, Пособие, Копилка, Цель, Забота, Настроение, Этап, Задание, Словарик, Игровой день, Три решения, Взрослый раздел. Avoid: аккаунт, регистрация, здоровье, счастье, уровень, аватар, справка, кошелёк.

## Comments

**2026-09-19 — pet-first redesign implemented.** The old Onboarding and ProfileSetup routes were replaced by FirstRun (Питомец → Имена → «Как играть») plus replay-only HowToPlay. The in-memory draft commits through an atomic, idempotent session operation only after the explanation is finished or skipped. Navigation-root tests cover phase order, all skip points, Back retention, validation, grapheme-aware names, failure retry, replay safety, returning launch, and profile deletion. Repository tests cover atomic activation, rollback, retry, and one Стартовый бюджет grant. Full suite: 68/68; typecheck and lint clean.

Device Appendix A 1–4 was not run here (same Android SDK gap as M0). Follow-up on a machine with an emulator: 3×3×3 pet → names → pet-spoken rules → Стартовый бюджет → hub with Скейтборд and «Первый план», enlarged text, Android Back, and airplane mode.
