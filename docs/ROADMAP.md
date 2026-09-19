# FinPet (ФинПет) — Implementation Roadmap

Master plan for an LLM implementing the app in this repo. Read in this order before writing any code:

1. [`CONTEXT.md`](../CONTEXT.md) — domain vocabulary. Use these exact RU terms in UI strings and code names.
2. [`docs/REQUIREMENTS.md`](./REQUIREMENTS.md) — the hackathon requirements with every `→ Specify:` slot resolved inline. Requirement IDs (`R1`–`R14`, `TC`, `UX`, `HP`, `ND`) refer to its sections.
3. [`docs/adr/`](./adr/) — why React Native, and why the day cadence works as it does.
4. This document — everything else: settled decisions, architecture, **design flow (§4)**, milestones, content, tests.

Team-owned deliverables (presentation PPTX, demo video, RuStore card) are **out of scope** for the implementation work; §11 lists what to hand over to them.

---

## 1. Ground rules (invariants for every milestone)

- **Fully offline.** Zero network calls in MVP. No Android permissions beyond defaults. No secrets in the repo.
- **RU-only UI.** All user-facing strings in Russian, ages 7–11 register: short phrases, no shaming, complex terms only from Словарик.
- **No real money, no ads, no purchases, no social, no external links** (see `HP` in REQUIREMENTS.md).
- **Balance never changes silently.** Every coin movement goes through the feedback card (source + amount).
- **Safe errors.** A wrong decision lowers Забота/Настроение and spawns a timed correction Задание — never progress reset, never pet death/illness (no exceptional events in v1).
- **Content decoupled.** Catalog, goals, tasks, glossary = versioned JSON in `assets/content/`, zod-validated at load, never hardcoded in components. Bump `contentVersion`; new tasks ship without touching app logic.
- **Injectable clock.** All "today" reads go through a `Clock` port; Демо-режим swaps in a manual clock (ADR-0002).
- **Accessibility.** Touch targets ≥48×48 dp; body text ≥16 sp; verdicts/status shown as icon+text, never color alone; animations toggleable in settings; destructive actions double-confirmed.
- **Perf budget.** Launch → main screen ≤5 s (Hermes, no startup I/O beyond DB open); every action gives visual response ≤1 s (optimistic UI, effects applied synchronously).

## 2. Settled decisions — the answers to every `→ Specify:` slot

These were decided in the planning interview; do not re-derive them. If a number seems wrong, flag it — don't silently change it.

### 2.1 Economy (R4, R5, R6, R7)

| Parameter | Value |
|---|---|
| Currency | Монеты (coins), integer only |
| Стартовый бюджет | 100, granted once at profile creation with an explanation screen |
| Пособие (allowance) | +10, credited on first open of a new Игровой день |
| Task reward | +10, first correct completion of each Задание only; replays give 0 |
| Plan areas (≥3) | Обязательные / Желаемые / Копилка |

**Catalog — 8 items** (price / pet impact shown pre-purchase):

| # | Item | Kind | Price | Pet effect |
|---|---|---|---|---|
| 1 | Обед (lunch) | mandatory | 12 | Забота +10; skipping the day's lunch shows Забота drop |
| 2 | Школьные принадлежности | mandatory | 10 | Забота +5 |
| 3 | Проезд (transport) | mandatory | 8 | Забота +5 |
| 4 | Лекарство (medicine) | mandatory | 15 | Забота +20 |
| 5 | Конфета (candy) | optional | 5 | Настроение +5 |
| 6 | Стикеры (stickers) | optional | 7 | Настроение +6 |
| 7 | Кино (cinema visit) | optional | 20 | Настроение +12 |
| 8 | Игрушка (toy) | optional | 25 | Настроение +10 (priced high so an insufficient-funds attempt is easy to stage) |

**Goals — 3 presets:** Скейтборд 90 · Телескоп 160 · Велосипед 240. One **active goal** at a time; Копилка is a single pot attributed to the active goal; on reaching the cost the goal is achieved (celebration screen, pot reduced by cost). Completion-date estimate = remaining ÷ average deposit (rolling over recent transfers), shown only after ≥1 transfer, else «—».

**Day rules:** Игровой день opens when the player starts it (unlocked at local midnight in normal play; back-to-back in Демо-режим). Day close sequence: compute day score → update meters' decay/messages → recompute Этап → show Итоги дня (plan-vs-actual, stage change explanation) → offer next day.

### 2.2 Pet (R2, R3, R9, R10)

- **Identity:** the profile "character" **is** the pet. Appearance = Вид (species) + Окрас (color) + Аксессуар (accessory): **3 × 3 × 3 = 27 combinations** (≥9 required), designer's PNG bundle.
- Species/color/accessory keys: `sp1|sp2|sp3`, `c1|c2|c3`, `a1|a2|a3`. Display names come from the team with the asset drop; placeholders until then.
- **Meters (the "key status indicators"):** Забота and Настроение, 0–100, rendered as icon + bar (never color alone).
  - Забота: +N on mandatory purchases (values above); −15 when a day ends with an unpurchased mandatory item.
  - Настроение: +N on optional purchases and on goal achievement; −5 when actual optional spending exceeds the plan bucket.
- **Этапы (stages):** Новичок → Друг → Мастер. Per-day score: **+2** all mandatory purchases made · **+1** actual spend ≤ plan · **+1** savings deposit made. Stage = rolling sum over the last 3 closed days: **<3 Новичок, 3–8 Друг, ≥9 Мастер**. Recomputed at every day close; any change shows a kid-worded explanation. Visuals faked programmatically (scale/glow tint) — see the asset contract in §5.4.
- **Reactions/recovery (R9 slot):** no illness/death events in v1. Negative meters only cause sad pose + explanation + timed correction task. The doc's "unforeseen medical expense" exists solely as the Лекарство catalog item (event variant is stretch, §2.6).

### 2.3 Задания (R8)

6 tasks, 2 per topic. Unlock order in normal play: topics sequential `budget → savings → payments`, one new task per day; completed tasks replayable (no reward). In Демо-режиме **all 6 are open from the start**. Full scripts in §6; JSON schema in §5.3.

### 2.4 Взрослый раздел & Демо-режим (R12, R13)

- **Gate:** random two-digit × one-digit multiplication (e.g., 14 × 7); wrong answer → new question. Asked on every entry (session-scoped).
- **Contents:** learning progress (topics completed + overall, positive wording only) · Демо-режим toggle · profile reset/delete (extra confirmation, typed action) · Родительский бонус is **stretch** (§2.6).
- **Демо-режим:** toggled in Взрослый раздел; creates/switches to a dedicated demo profile (`isDemo = true`), pre-onboarded, with the manual clock; "Сбросить демо" restores its initial state; exit returns to the normal profile untouched. Must sustain **≥5 consecutive days** end-to-end (R13, Appendix A).

### 2.5 Первый запуск & help (R1, R11)

- Первый запуск is ordered Питомец → Имя → «Как играть». Appearance and the pet name remain an in-memory draft until «Как играть» is finished or skipped; only then is the Профиль ребёнка created. Naming is one pet-spoken field; on commit the leftover persistence `name` equals `petName`.
- «Как играть» is 3 passive, non-clickable steps. The customized pet remains visible and speaks one first-person bubble per step: why decisions affect the pet · Три решения (обязательное / желаемое / отложить) · the Игровой день loop (plan, spend, save, review). «Дальше» advances; the last step uses «Играть!». «Пропустить» is available on every step.
- Help re-access: Словарик screen = «Как играть» (same pet explanation, «Готово» / «Закрыть», no profile write) + the 10 terms with kid definitions: Баланс, Копилка, Цель, Пособие, Обязательные расходы, Желаемые расходы, Забота, Настроение, Этап, Игровой день (one-to-one with `CONTEXT.md`).

### 2.6 Stretch tier (build only after M6; never blocks the mandatory scope)

In build order: (1) animation/sound polish + mute toggle · (2) Родительский бонус (+5/+10/+20 once per day with optional reason, logged as a transaction) · (3) «неожиданные расходы» medical event · (4) tablet/landscape · (5) **Помощник** — kid-visible LLM chat button on the main screen: feature-flagged off by default, optional (never required), topic-restricted RU system prompt, no personal data in requests, no links in output, API key via local `.env` (never committed), explicit no-connection message. (See CONTEXT.md «Помощник».)

## 3. Architecture

Stack: **React Native + Expo (managed) + TypeScript**, React Navigation (stack), **expo-sqlite + Drizzle ORM**, zod, jest. Decisions and trade-offs in [ADR-0001](./adr/0001-react-native-expo-drizzle-expo-sqlite.md); day cadence in [ADR-0002](./adr/0002-real-calendar-day-cadence-demo-untied.md).

App identity: `applicationId org.hseteamspb.finpet` · display name «ФинПет» · `versionName 0.1.0` · `versionCode 1` · portrait-only · `minSdkVersion 26` (Android 8.0) via `expo-build-properties` · release APK signed with a locally generated keystore (never committed; generation documented in README).

```
src/
  core/            # PURE domain logic — no React/Expo imports; jest-tested
    economy.ts     #   grants, allowance, purchases, blocking, plan validation
    savings.ts     #   transfers, withdrawal, goal math, date estimate
    stages.ts      #   day score, rolling window, stage thresholds
    days.ts        #   day open/close, unlock rules (uses Clock)
    tasks.ts       #   task runner: nodes, verdicts, unlock order
    clock.ts       #   Clock port + SystemClock + ManualClock (demo)
  data/
    db.ts schema.ts repositories/   # Drizzle over expo-sqlite; migrations
    content.ts     # loads+validates assets/content/*.json (zod), contentVersion check
  ui/
    screens/       # FirstRun, Main, Plan, Purchases, Savings,
                   # Tasks, TaskRun, Progress, Adult, Settings, Glossary
    components/    # PetView, MeterBar, CoinBadge, FeedbackCard, ConfirmSheet…
    theme.ts strings.ts   # RU strings; spacing/type scale ≥16 sp
assets/
  content/         # catalog.json goals.json tasks.json terms.json hint.json
  pets/            # designer drop — contract in §5.4
docs/
```

### 3.1 Navigation map

`FirstRun (Питомец → Имя → Как играть) → StartingBudget → Main`. Main is a hub: pet + meters top, coin badges, active-goal card, active-task card; buttons (≥48 dp) to План, Магазин (purchases), Копилка, Задания, Прогресс (progress + Журнал + Словарик), Взрослый раздел. Every screen reachable in ≤2 taps; back never traps the user (no dead ends, `TC`). Screen-by-screen specifications and flows: §4.

### 3.2 Storage schema (Drizzle/SQLite; R13 slot)

```
profiles(id PK, name, species, color, accessory, petName, balance INT,
         isDemo INT, contentVersion, createdAt)
days(id PK = profile||'#'||n, profileId FK, n INT, openedAt, closedAt?)
plans(id PK, profileId FK, dayId FK, mandatory INT, optional INT, savings INT,
      status 'draft'|'confirmed', confirmedAt?)
transactions(id PK, profileId FK, dayId FK, kind, amount INT(signed),
             itemId?, goalId?, labelKey, createdAt)
purchases(id PK, profileId FK, dayId FK, itemId, price INT, kind, createdAt)
savingsTransfers(id PK, profileId FK, dayId FK, amount INT, kind 'in'|'out', createdAt)
goals(id PK, profileId FK, key, cost INT, status 'active'|'achieved',
      isActive INT, achievedAt?)
petState(profileId PK, care INT, mood INT, stage INT)
meterEvents(id PK, profileId FK, dayId FK, meter, delta INT, source, createdAt)
dayScores(id PK, profileId FK, dayId FK, mandatoryCovered INT, withinPlan INT,
          deposited INT, score INT)
taskProgress(id PK, profileId FK, taskKey, status, rewardPaid INT, completedAt?)
meta(key PK, value)          -- activeProfileId, onboardingDone, animationsOn…
```

Invariants (unit-tested): `profiles.balance == Σ transactions.amount` for every profile; balance can never go negative; Копилка = Σ `savingsTransfers('in')` − Σ `('out')` ≥ 0; a confirmed plan is immutable for its day.

### 3.3 Flow of a purchase (reference for all coin movements)

Catalog tap → item sheet (price, category, pet impact estimate) → confirm → `core/economy` validates balance (else blocked screen: what's missing + options: wait for Пособие, do a Задание, postpone) → debit → transaction + purchase rows → meter event → FeedbackCard: «Баланс −12 · Забота +10 · причина и следующий шаг».

## 4. Design flow — screens

Written for 360 dp portrait, RU copy, ages 7–11. Conventions for every screen: an empty/disabled state always explains what to do next (no dead ends); every verdict/status is icon + text (never color alone); destructive actions are double-confirmed; every coin/meter movement ends in a FeedbackCard.

**Chrome (all current child-facing screens):** cream/orange FinPet identity, system font, Russian sentence case. Shared kit: Screen, Card, raised PrimaryButton (darker bottom edge; depresses on press; disabled = flat grey), TextButton, Chip (visible check + `aria-selected`), SpeechBubble, Badge, NavTile (pictogram + word), PetView, MeterBar, BackButton labelled «Назад». Type scale: title / section / body / button; body ≥16 sp. Linear flows (Первый запуск, «Как играть») pin the primary action at the bottom; Main stays one scrolling hub. Do not import streak/hearts/XP, a lesson path, an owl mascot, or green-as-success-only.

### 4.1 Screen map

```
Launch
 ├─ first run ──→ FirstRun [Питомец → Имя → Как играть] ─→ StartingBudget ─┐
 └─ returning ──────────────────────────────────────────────────→ Main ◄─────┘

Main (hub) ── day loop lives here
 ├─ План ────────→ Plan (draft → confirm → plan-vs-actual)
 ├─ Магазин ─────→ Catalog ─→ ItemSheet ─→ Confirm ─→ FeedbackCard
 │                             └─ insufficient ─→ BlockedSheet
 ├─ Копилка ─────→ Savings ─→ TransferIn / WithdrawPreview ─→ Confirm ─→ FeedbackCard
 │                             └─ goal reached ─→ Celebration
 ├─ Задания ─────→ TaskList ─→ TaskRun (nodes) ─→ TaskResult
 ├─ Прогресс ────→ Progress [Итоги | Журнал | Словарик]
 │      Словарик tab ─→ «Как играть» (replays the pet's explanation)
 ├─ Взрослый раздел → AdultGate ─→ Adult (progress · demo toggle · reset)
 ├─ ⚙ Settings (animations, about)
 └─ «Закончить день» (once plan confirmed) ─→ DaySummary ─→ next day
```

### 4.2 Screen specifications

**1–2. FirstRun.** *Purpose:* let the child make the pet theirs before that pet explains the game, without writing a partial profile (R1, R2). One controlled journey owns an in-memory draft and shows the phase labels «Питомец», «Имя», «Как играть». *Питомец:* a complete default pet is selected; live preview plus bead sliders for «Вид» (3), «Окрас» (3), and «Аксессуар» (3); the selected stop is the accent bead in its circle, not a Chip check. *Имя:* the same customized pet remains visible and speaks one SpeechBubble «Меня зовут ____», which live-echoes the typed pet name; one unlabeled field (accessible name «Имя») under the bubble accepts 1–20 visible characters after trimming; «Дальше» stays disabled until that name is valid; disabled primary is flat grey. *Как играть:* pet centered above a SpeechBubble with a tail pointing up; pet name visible; idle pose; one first-person bubble per step: decisions affect the pet · Три решения · plan/spend/save/review. A passive indicator announces «Шаг N из 3» and never acts as navigation. Primary actions sit in a pinned bottom bar: steps 1–2 «Дальше»; step 3 «Играть!»; quiet «Пропустить» under the primary. Visible and Android Back traverse the draft without losing choices; Back from Питомец may exit, and reopening restarts from defaults. Finishing or skipping atomically creates the profile (leftover persistence `name` equals `petName`, both the trimmed pet name), then leaves for StartingBudget; on failure the draft remains and «Не получилось начать игру. Попробуй ещё раз.» offers retry. No profile row is written earlier. Replay from Словарик reuses only «Как играть», with the existing pet, «Готово» / «Закрыть», and no profile write. On «Имя», TalkBack announces the visible sentence («Меня зовут ____» / «Меня зовут Пух») and the pet image describes appearance without a name. On «Как играть», each bubble is one message «Питомец [имя] говорит: …» and the decorative pet image is hidden from that step's reading order.

**3. StartingBudget (one-time modal).** *Purpose:* grant +100 with explanation (R4, loop step 4). *Zones:* «Тебе дали 100 монет на старт!», coin art, short line «Это твой бюджет. Планируй, копи, заботься о питомце», button «Понятно». *Leaves:* Main (transaction `starting_grant` + FeedbackCard).

**4. Main (hub).** *Purpose:* everything required visible at once (R3). *Zones, top→bottom:* Badge strip (Этап, Баланс, Копилка — icon + word + number); large centered pet (pose by meters: happy/idle/sad); ⚙ remains a labelled control → Settings; Забота and Настроение as chunky MeterBars (icon + bar + number); Пособие ribbon when credited today; Card for active Цель (name, accumulated/cost, remaining); Card for active Задание (title + «Играть»); 2×3 NavTiles (pictogram + word: План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел); raised «Закончить день». Plan-not-confirmed highlight on the План tile includes a check plus «Составь план дня», never color alone. *States:* plan not confirmed → План tile highlighted with hint «Составь план дня», «Закончить день» prompts to plan first; plan confirmed → tile badge «План готов»; normal play before midnight → banner «Новый день откроется завтра», economy tiles disabled with explanation, Задания replays and Словарик stay open (no dead end); Демо-режим → banner «Демо: дни идут подряд» + «Следующий день» always active.

**5. Plan (План).** *Purpose:* distribute funds across 3 areas (R5). *Zones:* available amount header (balance incl. today's Пособие); three bucket rows — Обязательные, Желаемые, Копилка — each with −/+ steppers and a pictogram; running total vs available; remainder line «Останется свободных: N»; validation line when total > available (blocks confirm); «Подтвердить план». *States:* draft (editable) → confirmed (locked; confirmation sheet explains what the plan does) → during-day view adds plan-vs-actual columns (план / потрачено per bucket) → day closed (read-only). *Leaves:* Main.

**6. Catalog (Магазин).** *Purpose:* purchases with informed consent (R6). *Zones:* tabs «Обязательное» / «Желаемое» (pictogram + label); item cards: name, price, category icon, pet-impact preview (meter icon + «+10»), «после покупки: N монет»; tap → ItemSheet (full description + «Купить» / «Отложить»). *States:* purchased today → card badge «Куплено»; insufficient funds → BlockedSheet: «Не хватает N монет» + options list (дождаться Пособия · выполнить Задание · отложить покупку) — no purchase happens. *Leaves:* confirm → FeedbackCard (§3.3).

**7. Savings (Копилка).** *Purpose:* savings & goals (R7). *Zones:* pot total large; active-goal card (cost, accumulated, remaining, date estimate «—» until first transfer); goal picker (3 presets, switch active); «Положить» → TransferIn sheet (stepper ≤ balance, confirm); «Забрать» → WithdrawPreview (pot after, «мечта отодвинется на N дней», separate confirm). *States:* accumulated ≥ cost → Celebration screen («Мечта сбылась!», pot −cost, Настроение +, confetti icon). *Leaves:* FeedbackCard; goal switch anytime.

**8. TaskList (Задания).** *Purpose:* learning content entry (R8). *Zones:* three topic groups (Бюджет, Копилки, Платежи) × 2 cards each: title, topic icon, reward badge «+10» if unclaimed, completed badge. *States:* locked → «Откроется: завтра» (normal play) / all open (Демо-режим); completed → replayable, no reward. *Leaves:* TaskRun.

**9. TaskRun.** *Purpose:* play one Задание node by node. *Zones:* node text (scene), pet pose reacting to the last verdict, option buttons (≥48 dp), after a tap: verdict banner (✅/🤔/⚠️ icon + word) + explanation panel + «Дальше». `retry` returns into the same node (correction path); `spawnTask` shows «Новое задание появилось в списке!». *Leaves:* TaskResult.

**10. TaskResult.** *Zones:* outcome summary, «+10 монет» if first correct completion, «В список заданий». *Leaves:* TaskList.

**11. Progress (Прогресс) — 3 tabs.** *Purpose:* history & learning progress (R11). *Итоги:* last day card (day score breakdown as +2/+1/+1 icons, plan-vs-actual, meter changes with reasons) + overall (days played, tasks done x/6, goals achieved). *Журнал:* chronological transactions grouped by day with source labels (Пособие, Покупка: Обед, Перевод в копилку, …). *Словарик:* the 10 terms as accordion + «Как играть» replay button.

**12. AdultGate.** *Purpose:* adult gate (R12). *Zones:* «Сколько будет 14 × 7?» (random two-digit × one-digit), numeric input, «Войти». *States:* wrong → new question (after 2 attempts), no hints. *Leaves:* Adult.

**13. Adult (Взрослый раздел).** *Zones:* progress overview (topics completed, days played — positive wording only); Демо-режим toggle (on → confirm sheet «Демо создаёт отдельный тестовый профиль»; off → returns to normal profile); «Сбросить демо»; «Сбросить прогресс» / «Удалить профиль» with typed confirmation. *States:* stretch — Родительский бонус card (§2.6). *Leaves:* Main / demo Main.

**14. DaySummary (Итоги дня).** *Purpose:* close the day with the full picture (R9, loop step 9–10). *Zones:* plan-vs-actual table; day score breakdown (icons for +2 mandatory, +1 within plan, +1 deposit); meter changes with one-line reasons; stage banner if changed (Новичок → Друг + explanation); button «Ждём завтра!» (normal) / «Следующий день» (demo). *Leaves:* Main.

**15. Settings (⚙).** *Zones:* animations toggle (UX constraint), about: app name, version 0.1.0, build 1. *Leaves:* Main.

**16. FeedbackCard (component, bottom sheet).** *Zones:* delta rows with icons (Баланс ±N · Копилка ±N · Забота ±N · Настроение ±N), cause line («Потому что…»), next-step line («Что дальше: …» from content JSON), button «Понятно». Every row is also appended to Журнал. Used after: grant, Пособие, purchase, blocked purchase (variation), transfer, withdrawal, task reward, goal achievement, parent bonus (stretch).

### 4.3 Key flows

- **First launch (Appendix A 1–4):** Launch → FirstRun Питомец → Имя → «Как играть» finished or skipped (profile created) → StartingBudget modal → Main → hint «Составь план дня» → Plan. Force-quit before profile creation discards the draft and restarts at Питомец.
- **Day loop (normal & demo):** day opens on entering Main after unlock → Пособие +10 via FeedbackCard → Plan confirmed → free play (Магазин / Задания / Копилка; plan-vs-actual live on Plan) → «Закончить день» → DaySummary → next day unlocks (demo: immediately; normal: tomorrow). After day close in normal play the economy is frozen until the next day; Задания replays and Словарик remain available.
- **Insufficient funds (Appendix A 7):** Магазин → buy Игрушка (25) at balance < 25 → BlockedSheet (needs N more; options) → a way out exists in-app (Задание now, Пособие tomorrow, or postpone).
- **Savings withdrawal (R7):** Копилка → «Забрать» → amount → WithdrawPreview (pot after, date shift) → separate confirm → FeedbackCard.
- **Correction path / safe error (R9):** bad verdict or skipped mandatory item → meter drop + sad pose + explanation + `spawnTask` correction Задание or next-day plan-adjust hint; progress is never reset.
- **Demo walkthrough (Appendix A 12):** Main → Взрослый раздел → AdultGate → demo toggle → demo Main (fresh test profile, all tasks open, «Следующий день» free) → ≥5 back-to-back days → «Сбросить демо» restores initial state → exit returns to the normal profile.
- **Persistence (Appendix A 11):** every mutation writes through to SQLite immediately; kill & relaunch lands on Main with profile, balance, purchases, savings, goal, and learning progress intact.

## 5. Content contracts

### 5.1 `catalog.json`

```json
{ "contentVersion": 1, "items": [
  { "id": "lunch", "name": "Обед", "kind": "mandatory", "price": 12,
    "effect": { "meter": "care", "delta": 10 },
    "description": "Питомцу нужно есть каждый день" } ] }
```

### 5.2 `goals.json` / `terms.json` / `hint.json`

Goals: `{ id, name, cost, description }` (3 presets, §2.1). Terms: the 10 glossary entries. Hint: the pet's 3 first-person «Как играть» bubbles. Existing `title` and `body` fields remain for content compatibility; the FirstRun UI renders `body` as speech and does not render `title`.

### 5.3 `tasks.json` — task node schema

```json
{ "contentVersion": 1, "tasks": [
  { "id": "budget_first_plan", "topic": "budget", "title": "Первый план",
    "reward": 10, "intro": "…",
    "nodes": [
      { "id": "start", "text": "…",
        "options": [
          { "label": "…", "next": "node2 | retry | exit",
            "verdict": "good | warn | bad",
            "explanation": "…",
            "effect": { "meter": "care", "delta": 5 },
            "spawnTask": null } ] } ] } ] }
```

Rules: every option carries `explanation` (shown after the action, regardless of verdict — R8); `verdict` renders icon+text, never color-only (`UX`); `retry` = correction path back into the same node; `spawnTask` enqueues a timed correction Задание (safe-error rule, R9); runner is generic — a new task is data only.

### 5.4 Designer asset drop — `assets/pets/` (expected contract)

```
pets/sp{1|2|3}/c{1|2|3}/
  idle.png  happy.png  sad.png        # base poses, transparent PNG
pets/overlays/a{1|2|3}.png            # accessory, transparent PNG, centered
```

PetView layers base pose + accessory overlay; stage fake = reanimated scale/glow per Этап; pose switches tweened. Until assets arrive, ship gray placeholder PNGs with the same names so all screens work.

## 6. The six Задания — full scripts (RU copy)

Verdicts: `good` ✅ / `warn` 🤔 / `bad` ⚠️ — always with icon, text, and explanation.

### 6.1 «Первый план» — budget_first_plan
Intro: «Сегодня школьная ярмарка! У питомца нет обеда, а ты хочешь мороженое. У тебя 20 монет.»
- **N1 «С чего начнёшь?»**
  - ✅ «Купить обед (10)» → Забота +5 → N2. «Обязательные расходы — самое важное. Сначала нужды, потом мечты.»
  - ⚠️ «Сначала мороженое (7)» → retry. «На обед больше не хватает. Желаемое подождёт, а питомец — нет.»
  - ⚠️ «Всё в копилку (20)» → retry. «Копить хорошо, но питомец остался голодным. Обязательное важнее.»
- **N2 «Обед куплен. Сколько отложить в копилку?»** (осталось 10)
  - ✅ «5 монет» → exit. «Копилка растёт, и монеты остались на ярмарку.»
  - 🤔 «Все 10» → exit. «Щедро! Но на мелочи не останется ни одной монеты.»
  - 🤔 «Ни одной» → exit. «Копилка не вырастет — мечта отодвинется. Решение с ценой.»

### 6.2 «Сломался рюкзак» — budget_backpack
Intro: «У питомца порвался рюкзак. Починка — 8 монет. Но ты уже запланировал киндер-яйцо за 8!»
- **N1 «Что делать?»**
  - ✅ «Починить рюкзак, яйцо — потом» → exit. «Отложить желаемое — тоже решение. Рюкзак важнее.»
  - ⚠️ «Сначала яйцо» → Настроение +5, затем Забота −15, **spawnTask «Почини рюкзак»** → exit. «Обязательный ремонт нельзя пропускать. Вот задание, чтобы всё исправить.»
  - 🤔 «Взять из копилки» → preview: дата мечты +1 день → exit. «Можно, но копилка — для мечты, и дата отодвинулась. В следующий раз лучше отложить желаемое.»

### 6.3 «Копилка мечты» — savings_dream_jar
Intro: «Скейт стоит 90 монет. Каждый день можешь откладывать 15. Смотри: 90 : 15 = 6 дней.»
- **N1 «День 1: откладываешь?»**
  - ✅ «Кладу 15» → exit. «Осталось 5 дней. Регулярность бьёт рекорды!»
  - 🤔 «Пропущу, куплю наклейки» → exit. «Пропуск двигает мечту на день: теперь 7. Решение с ценой.»
  - ⚠️ «Заберу всё из копилки» → preview сброса → exit. «Начинать заново обидно. Маленький вклад каждый день — самый честный путь.»

### 6.4 «Большая распродажа» — savings_big_sale
Intro: «Наклейки стоят 7 вместо 14 — только сегодня! В копилке 30 монет на скейт.»
- **N1**
  - ✅ «Проверить дневной бюджет» → хватает → exit. «Молодец: копилка не тронута, а наклейки — твои!»
  - 🤔 «Купить из копилки» → preview: 30→23, дата +1 день → **N2**. «Выгода видна, и цена решения — тоже.»
  - 🤔 «Не покупать» → exit. «Тоже решение: мечта не сдвинулась. Распродажи бывают ещё.»
- **N2 «Скейт теперь на день позже. Как оценишь своё решение?»**
  - ✅ «Я знал(а) цену — норм» / 🤔 «Зря» → оба exit. «Главное — видеть цену решения до того, как платишь.»

### 6.5 «Две цены» — payments_two_prices
Intro: «Питомцу нужен альбом. У школы — 15 монет. За углом такой же — 10.»
- **N1**
  - ✅ «За углом за 10» → exit. «Одинаковое — бери дешевле. Сэкономил 5 монет!»
  - ⚠️ «У школы за 15» → retry. «Ты переплатил 5 за тот же альбом. Сравнивай цены до оплаты!»
- **N2 «А на улице продают фломастер за 3. В магазине такой же стоит 8.»**
  - ⚠️ «Взять за 3» → ломается → retry. «Слишком дешёвое часто ломается сразу. Дешёвый — не значит выгодный.»
  - ✅ «Из магазина за 8» → exit. «Надёжная вещь служит дольше. Считай не только цену.»

### 6.6 «Чек» — payments_receipt
Intro: «Обед 12 + сок 4, дал 20. Продавец вернул сдачу 2. Всё верно?»
- **N1**
  - ✅ «Проверить чек» → exit, **+2 монеты возврат**. «12 + 4 = 16, сдача должна быть 4! Ошибка нашлась.»
  - 🤔 «Спросить продавца, сколько всего» → exit, +2. «Переспросить — тоже хорошо. Ошибка нашлась.»
  - ⚠️ «Забрать и уйти» → exit. «Ты потерял 2 монеты. Проверяй сдачу — так деньги не теряются.»

## 7. Milestones (11 days)

Each milestone ends with a demoable increment. Do not start a stretch item (§2.6) before M6 is done.

- **M0 — Scaffold (Day 1).** Expo RN TS init; app identity per §3; React Navigation; Drizzle+expo-sqlite wiring + migration path; jest; placeholder pet assets; empty Main screen in RU.
  *AC:* release APK builds and installs on an Android 8.0 (API 26) emulator; portrait locked; cold launch → Main ≤5 s.
- **M1 — Domain core (Days 1–2).** `core/` modules + Clock port; content loader with zod; repositories + schema (§3.2) with invariants. Jest suite covering the four mandated areas: **budgeting, debiting, savings, progress/stages** + day gating.
  *AC:* `npm test` green; no UI yet.
- **M2 — Первый запуск, pet, hub (Days 2–4).** Screens per §4.2 #1–4: FirstRun state machine (3×3×3 pet customization → «Имя» for the Питомец only → 3 skippable speech bubbles from the pet); atomic profile creation after the explanation; Стартовый бюджет grant screen (+100, explained); Main hub with meters/badges/active cards; Словарик + «Как играть» replay.
  *AC:* Appendix A steps 1–4 passable end-to-end on device.
- **M3 — Economy loop UI (Days 4–6).** Screens per §4.2 #5–7, 11, 16: План (3 buckets, total ≤ available, remainder shown, editable until confirmed, plan-vs-actual); Магазин (8 items, pre-purchase sheet, confirm, insufficient-funds block with options); Копилка (3 goals, active goal, transfers in, withdrawal with double confirm + before/after + date shift); Журнал; FeedbackCard on every coin/meter movement.
  *AC:* steps 5–9 passable; a wrong-path purchase demonstrates the safe-error rule (no dead ends).
- **M4 — Задания + Демо-режим (Days 6–7).** Generic task runner (nodes/verdicts/explanations/retry/spawnTask); 6 tasks from §6 as JSON; unlock 1/day topic-ordered, all open in demo; demo profile + ManualClock + «Сбросить демо» + exit; day-close sequence with stage recompute and explanations (§4.2 #14).
  *AC:* step 10; **5 consecutive demo days** playable back-to-back; reset restores initial demo state; normal profile still real-day-gated.
- **M5 — Взрослый раздел + persistence (Days 7–8).** Screens per §4.2 #12–13; arithmetic gate; progress view (positive wording); demo toggle; reset/delete with confirmations; kill-and-relaunch persistence check across profile, balance, purchases, savings, goal, task progress.
  *AC:* steps 11–12; **full Appendix A pass (1–12) on a physical device**, twice in a row.
- **M6 — Hardening (Days 8–9).** Perf budget checks; accessibility pass (48 dp, 16 sp, icon+text verdicts, animations toggle, font-scaling check); destructive-action confirmations; permission audit (`adb dumpsys` shows none beyond defaults); airplane-mode full run; crash-free demo ×2.
  *AC:* the `TC`/`UX` checklist in §8 fully checked; no crashes/dead ends in the mandatory scenario.
- **M7 — Docs & release (Days 9–10).** Docs pack (§11); signed release APK (`versionName 0.1.0`, `versionCode 1`); demo rehearsal following Appendix A as a script.
  *AC:* stranger-completes-README test: fresh clone → APK on device in ≤30 min.
- **M8 — Freeze (Day 11).** Final APK + tag `v0.1.0`; hand-off list to the team (§11); buffer for regressions only.

## 8. Test plan

**Automated (jest, `src/core` + repositories):** plan validation (sum ≤ available; draft editable; confirm locks); debit (over-balance rejected, never negative, transaction+history written); savings (in/out, withdrawal gated by confirm, goal completion, date estimate monotone under new deposits); stages (+2/+1/+1 day score, rolling-3 window, thresholds 3/9, explanation emitted on change); days (next-calendar-day unlock via fake Clock; ManualClock back-to-back); persistence (schema roundtrip; balance invariant).

**Manual scripted (documented in `docs/test-cases.md`):** Appendix A steps 1–12 as named cases (screen sequence per §4.3 flows); low-end Android 8.0 emulator + one mid-range physical device; airplane mode (offline invariant); font-size 1.3× legibility; demo reset; relaunch persistence; insufficient-funds staging (buy Игрушка at low balance → BlockedSheet shows options).

**Test report:** `docs/test-report.md` filled at M6, listing each case × device × result.

## 9. Requirements traceability

| Req | Where settled/implemented |
|---|---|
| R1 first run / «Как играть» | §2.5 · §4.2 · M2 |
| R2 pet creation, 9+ combos | §2.2 (27) · §5.4 · M2 |
| R3 main screen contents | §2.2 · §3.1, §4 · M2 |
| R4 currency/income | §2.1 · §3.3 · M1, M2 |
| R5 budget planning | §2.1 day rules · §4.2 · M3 |
| R6 purchases (8 items) | §2.1 catalog · §4.2 · M3 |
| R7 savings & goals | §2.1 goals · §4.2 · M3 |
| R8 6 tasks / 3 topics | §2.3 · §6 · M4 |
| R9 consequences/feedback | §2.2 meters · §5.3 safe-error · M3, M4 |
| R10 3 stages + rules | §2.2 Этапы · M1, M4 |
| R11 history + terms | §2.5 terms · §3.2 · M3, M5 |
| R12 adult section | §2.4 · M5 |
| R13 persistence + demo | §2.4 · §3.2 · M4, M5 |
| R14 Appendix A loop | §4.3 flows · §7 milestone ACs · §8 manual cases |
| TC offline/storage/perf/APK/tests | §1, §3, §7, §8 |
| UX | §1 ground rules · M6 |
| HP prohibitions | §1; re-audit at M6 |
| ND repo docs | §11 |

## 10. Risks & mitigations

- **RN cold start on Android 8 low-end** → Hermes, no startup work beyond DB open, splash → measured at M0 and M6.
- **Designer assets late** → §5.4 placeholder contract keeps every screen functional; names swap = data only.
- **Scope creep toward stretch items** → §2.6 is gated behind M6; mandatory traceability first.
- **Economy feels flat** → economics-tuning happens in `assets/content` numbers only; engine constants live in one config file.

## 11. Team hand-off (out of implementation scope)

The implementing LLM delivers to the team: final APK + version/build info, app icon 512×512 source, 3+ annotated screenshots for the RuStore card, the demo walkthrough script (Appendix A as a ≤3-min storyboard), and the docs pack (README, build/run, architecture, data structures, compliance matrix, formulas, content map, UX rationale, permissions/data, test cases + report, limitations, third-party licenses). The team owns: presentation slides, the video, RuStore card text, and any display names for `sp/c/a` keys with the final art drop.
