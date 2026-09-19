# M2 — Onboarding, pet, hub

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 M2, §4.2 screens #1–4, §2.2/§2.5, §5.4 · `docs/REQUIREMENTS.md` Appendix A 1–4, R1–R4 · `CONTEXT.md` · ADR-0001 · ADR-0002 · M0/M1 comments

## Problem Statement

A child who installs ФинПет still lands on an empty placeholder Main screen. They cannot meet the Питомец, pick how it looks, receive the Стартовый бюджет, or see Баланс / Забота / Настроение / Цель on the hub. Appendix A steps 1–4 (first launch, local Профиль ребёнка, pet customization, starting budget plus current Цель and available Задание) are not playable on a device, so later economy and task screens have nothing to hang off.

## Solution

Ship the first-run path and the Main hub exactly as ROADMAP §4.2 #1–4, plus Словарик with hint replay. First launch shows three skippable intro cards, then ProfileSetup writes a Профиль ребёнка only when the child taps «Играть!». The Стартовый бюджет screen explains the +100 Монет grant. Returning launches skip intro and land on Main. Main shows the Питомец (Вид + Окрас + Аксессуар, pose from meters), Этап, meters, coin badges, active Цель, the day's unlocked Задание, a 2×3 nav grid, and a highlighted prompt to compose a План. Словарик lists the ten glossary terms and can replay the three intro cards. Destinations that belong to later milestones are reachable stubs with a next-step explanation — never a dead end.

## User Stories

1. As a ребёнок on first launch, I want to see three skippable intro cards before any profile is written, so that I understand the game without being trapped.
2. As a ребёнок, I want the first card to explain what the game teaches, so that I know it is about caring for a Питомец and for Монеты.
3. As a ребёнок, I want the second card to explain Три решения (обязательное / желаемое / отложить), so that I know how to think before spending.
4. As a ребёнок, I want the third card to introduce the Питомец, so that I meet the creature I will care for.
5. As a ребёнок, I want page dots and «Начать» / «Пропустить», so that I can finish or skip the intro in one tap.
6. As a ребёнок who skipped or finished the intro, I want to land on ProfileSetup, so that creating a Профиль ребёнка is the next step.
7. As a ребёнок, I want to pick a Вид, Окрас, and Аксессуар from three options each (27 combinations), so that the Питомец looks like mine.
8. As a ребёнок, I want a live preview that updates as I change Вид, Окрас, and Аксессуар, so that I see the result before I commit.
9. As a ребёнок, I want to type «Как тебя зовут в игре?» and «Как зовут питомца?», so that the Профиль ребёнка has a game name and a pet name without collecting personal data.
10. As a ребёнок, I want «Играть!» disabled until both names have at least one non-space character, so that I cannot create an empty profile.
11. As a ребёнок, I want no profile row written until I tap «Играть!», so that backing out of setup leaves no leftover data.
12. As a ребёнок who force-quits before «Играть!», I want the next launch to start the first-run path again, so that a half-finished setup is not sticky.
13. As a ребёнок who taps «Играть!», I want the Стартовый бюджет screen to explain that I received 100 Монет, so that the first coin movement is never silent.
14. As a ребёнок on that screen, I want a short kid-worded line that this is my budget to plan, save, and care with, then «Понятно», so that I know what the coins are for.
15. As a ребёнок, I want that grant to happen exactly once (the +100 already recorded when the profile is created), so that I cannot farm the Стартовый бюджет by reopening the screen.
16. As a ребёнок who force-quits on the Стартовый бюджет screen, I want the next launch to open Main with the 100 already in Баланс, so that I am not asked to explain the grant twice.
17. As a ребёнок arriving on Main the first time, I want Игровой день 1 to open and Пособие +10 to be credited, so that the hub shows a real day with funds to plan.
18. As a ребёнок, I want a Пособие ribbon when that credit just happened, so that the extra ten Монет have a visible source.
19. As a returning ребёнок, I want launch to skip onboarding and ProfileSetup and open Main, so that I can keep playing immediately.
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
34. As a ребёнок, I want «Как играть» in Словарик to replay the three intro cards and then return to Словарик, so that the hint is never one-shot.
35. As a ребёнок, I want a ⚙ control on Main that opens a Settings stub with app name and version/build, so that the gear is not a dead end.
36. As a ребёнок, I want every user-facing string in Russian, short, and without shaming, so that the 7–11 register holds.
37. As a ребёнок, I want body text ≥16 sp and no verdict or status communicated by color alone, so that the hub stays readable.
38. As a ребёнок, I want placeholder pet art to still show a layered Питомец, so that a late designer drop is a file swap rather than a blocked milestone.
39. As a ребёнок, I want Вид / Окрас / Аксессуар keys persisted as `sp1|sp2|sp3`, `c1|c2|c3`, `a1|a2|a3`, so that real display names can land later without a schema change.
40. As a ребёнок, I want the app to stay fully offline with no new permissions, so that first-run works in airplane mode.
41. As a ребёнок, I want visual response to taps within 1 s, so that pickers, navigation, and «Играть!» feel immediate.
42. As a hackathon judge, I want Appendix A steps 1–4 passable end-to-end on a device, so that M2's acceptance criterion is demonstrable.
43. As a returning ребёнок, I want profile, pet appearance, names, Баланс (100 + Пособие), meters, Этап, and the default Цель intact after kill-and-relaunch, so that the hub is already persistent.
44. As a разработчик, I want intro card copy and glossary text to come from the versioned content files, so that wording changes do not touch screen logic.
45. As a разработчик, I want chrome strings (buttons, field labels, stub copy) in the centralized strings module using CONTEXT.md terms, so that synonyms like «аккаунт» or «здоровье» never leak into the UI.
46. As a разработчик, I want screens to talk to the existing game and meta repositories rather than a new persistence layer, so that M1 invariants stay the only write path.
47. As a разработчик, I want first-run routing to wait until the database has booted and meta is readable, so that the app never flashes Main before it knows whether a Профиль ребёнка exists.
48. As an accessibility reviewer, I want pickers, nav tiles, and primary buttons exposed as buttons with accessible names, so that tests and TalkBack share the same labels.

## Implementation Decisions

- **Reuse M1 writes; do not invent a second economy path.** Profile creation calls the existing game-repository `createProfile` (which already grants the Стартовый бюджет of 100 as a `starting_grant` transaction, seeds all three Цели, marks one active, and initializes Забота/Настроение at 50 and Этап Новичок). The Стартовый бюджет screen is explanation only — it must not credit again. First Main visit calls existing `openDay`, which credits Пособие +10 once.
- **Default active Цель** is the first content goal (Скейтборд, cost 90). Switching Цели is M3 Копилка work; M2 only displays the active one.
- **Extend the existing profile read**, not a new module: `getProfile` must also return Вид, Окрас, Аксессуар, and pet name so PetView can render. Hub also uses existing `savingsState` plus `unlockedTasks` from the domain core (day 1, not demo → «Первый план»). Do not add a parallel snapshot store.
- **Meta keys** already reserved: `onboardingDone`, `activeProfileId`. First-run when there is no `activeProfileId`. Completing ProfileSetup sets both. Do not persist a separate «starting budget seen» flag: if a profile exists, skip the grant screen on later launches.
- **Session bootstrap lives in the UI layer** and is the only place that decides Onboarding vs ProfileSetup vs StartingBudget vs Main. It waits for database boot, then reads meta. Screens receive repositories through a provider so jest-expo tests can inject fakes (the better-sqlite3 driver cannot load under the RN jest project).
- **Navigation:** native stack already in M0. Register Onboarding, ProfileSetup, StartingBudget, Main, Glossary (Словарик), Settings, and one shared stub screen for not-yet-built destinations. Main is the hub; back from stubs/glossary/settings returns to Main. Hint replay is the same Onboarding cards with an exit back to Словарик, not a new profile.
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
  1. **Navigation-root RNTL seam (primary, automated).** Render the app tree with fake game-repository and meta-repository adapters injected at the existing persistence seam (two adapters, one seam — expo-sqlite in the app, in-memory fakes in jest-expo). Drive Appendix A 1–4 with `userEvent`: first launch → three cards or skip → names + 3×3×3 pickers (preview reacts) → «Играть!» → Стартовый бюджет 100 explained → Main shows pet, Новичок, meters 50/50, Баланс 110 after day open, Копилка 0, Цель Скейтборд 0/90, Задание «Первый план», plan hint; Прогресс → ten terms + «Как играть» replays the three cards; returning launch with `activeProfileId` set skips intro. One flow test is worth more than a file per screen. Keep the existing Main render smoke only if it still reflects hub copy; otherwise replace it with hub assertions.
  2. **Device acceptance seam (AC).** Appendix A steps 1–4 on an Android device/emulator: first launch intro, local profile + 27-combo pet, Стартовый бюджет, Main with goal and available task. Airplane mode. This is the only place the milestone AC can be proven, matching M0's device seam.
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

**2026-09-19 — implemented.** First-run stack (Onboarding → ProfileSetup → StartingBudget → Main hub), Словарик with hint replay, stub destinations, Settings. `getProfile` now returns appearance. Navigation-root RNTL flow is green (`npm test` 54/54, typecheck and lint clean). Persistence seam is injected `SessionPorts` (live sqlite vs jest-expo fakes).

Device Appendix A 1–4 was not run here (same Android SDK gap as M0). Follow-up on a machine with an emulator: first launch intro, 3×3×3 pet, Стартовый бюджет, hub with Скейтборд and «Первый план», airplane mode.
