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
- **Safe errors.** A wrong decision lowers Сытость/Настроение and spawns a timed correction Задание — never progress reset, never pet death/illness (no exceptional events in v1).
- **Content decoupled.** Catalog, tasks, and glossary = versioned JSON in `assets/content/`, zod-validated at load, never hardcoded in components. Цели are catalog Желаемые, not a parallel content file. Bump `contentVersion`; new tasks ship without touching app logic.
- **Injectable clock.** All "today" reads go through a `Clock` port; Демо-режим swaps in a manual clock (ADR-0002).
- **Accessibility.** Touch targets ≥48×48 dp; body text ≥16 sp; verdicts/status shown as icon+text, never color alone; animations toggleable in settings; destructive actions double-confirmed.
- **Perf budget.** Launch → main screen ≤5 s (Hermes, no startup I/O beyond DB open); every action gives visual response ≤1 s (optimistic UI, effects applied synchronously).

## 2. Settled decisions — the answers to every `→ Specify:` slot

These were decided in the planning interview; do not re-derive them. If a number seems wrong, flag it — don't silently change it.

### 2.1 Economy (R4, R5, R6, R7)

| Parameter | Value |
|---|---|
| Currency | Монеты (coins), integer only |
| Стартовый бюджет | 100, granted once at profile creation, with no feedback card. The sixth opening card introduces it before Питомец |
| Пособие (allowance) | +20, credited on first open of a new Игровой день |
| Счета (day bills) | `catalog.json` `bills` cycle, day n = bills[(n − 1) mod 5]: Обед+Проезд 20 · +Школьные 30 · +Лекарство 35 («простыл») · +Школьные 30 · Обед+Проезд 20 |
| Task reward | up to the Задание's `reward` (10/15 by difficulty) × share of first-try answers (right 1, «с ценой» ½, wrong 0); a replay pays only the improvement over the best run (`taskProgress.bestReward`) |
| Plan areas (≥3) | Обязательные / Желаемые / Копилка |

**Catalog — 11 items** (price / pet impact shown pre-purchase; optional flag `once` defaults false):

| # | Item | Kind | Price | Pet effect |
|---|---|---|---|---|
| 1 | Обед (lunch) | mandatory | 12 | Сытость +10 and Настроение +5; skipping the day's lunch drops Сытость by 15 |
| 2 | Школьные принадлежности | mandatory | 10 | Настроение +5 |
| 3 | Проезд (transport) | mandatory | 8 | Настроение +5 |
| 4 | Лекарство (medicine) | mandatory | 15 | Настроение +20 |
| 5 | Конфета (candy) | optional | 5 | Настроение +5 |
| 6 | Стикеры (stickers) | optional | 7 | Настроение +6 |
| 7 | Кино (cinema visit) | optional | 20 | Настроение +12 |
| 8 | Игрушка (toy) | optional | 25 | Настроение +10 (priced high so an insufficient-funds attempt is easy to stage) |
| 9 | Скейтборд | optional, `once` | 90 | Настроение +12 |
| 10 | Телескоп | optional, `once` | 160 | Настроение +15 |
| 11 | Велосипед | optional, `once` | 240 | Настроение +18 |

**Цель:** one Желаемое from that catalog (at most one; not an Обязательное). First-run / demo seed Скейтборд. Копилка is a single pot attributed to the active Цель. «Положить» debits Баланс and grows the pot; reaching the price does not spend the pot and does not move Настроение. Celebration («Мечта сбылась!») offers «Купить из копилки» or «Позже»; buying from the pot deducts the price, records the purchase (item meter then), and clears the Цель. Completion-date estimate = remaining ÷ average deposit (rolling over recent transfers), shown only after ≥1 transfer, else «—».

**Day rules:** Игровой день opens when the player starts it (unlocked at local midnight in normal play; back-to-back in Демо-режим). When a day closes, the engine computes the day score, updates meter messages, recomputes Этап, and stores the record that Итоги reopens. Nothing in the play shell closes a day. How Задания advance the day is not specified yet (ADR-0002, ADR-0004).

**Банк (2026-09-24):** a Деньги option after `savings_where` is completed (Демо-режим: always). If the remembered section is Банк and the lesson is still locked, Деньги opens Копилка. Offers in `core/config.ts` `BANK`: 3 дня +10%, 5 дней +20%, minimum 10. «Открыть вклад» → confirm sheet → debit `bank_in` from Баланс; row in `deposits` (migration 5) with `maturesDayN = day n + days`. When a later Игровой день opens on Main, `collectDeposits` credits principal + floor(interest) as `bank_out` once and the day's FeedbackCard says «Вклад вернулся: +N (из них M — проценты)». No early withdrawal; Журнал labels «Вклад в банк» / «Вклад вернулся».

### 2.2 Pet (R2, R3, R9, R10)

- **Identity:** the profile "character" **is** the pet. Appearance = Вид (species) + Окрас (color) + Аксессуар (accessory): **3 × 3 × 3 = 27 combinations** (≥9 required), designer's PNG bundle.
- Species/color/accessory keys: `sp1|sp2|sp3`, `c1|c2|c3`, `a1|a2|a3`. Display names come from the team with the asset drop; placeholders until then.
- **Meters (the "key status indicators"):** Сытость and Настроение, 0–100, rendered as icon + bar (never color alone).
  - Сытость: +10 when Обед is bought; −15 when a day ends with that Обед unpaid. A drumstick marks the meter.
  - Настроение: +5 from Обед, plus the item's number from every other purchase (including a Цель bought from Копилка or Баланс). −15 once when another of today's Счета is unpaid, and −5 when actual optional spending exceeds the plan bucket. Both mood drops can land on the same day. A smile marks the meter. Reaching the Цель price does not move Настроение.
- **Этапы (stages):** Новичок → Друг → Мастер. Per-day score: **+2** all of today's Счета bought · **+1** «по плану» — Желаемые spend ≤ plan **and** Копилка deposits ≥ plan **and** purchases ≤ Обязательные + Желаемые · **+1** savings deposit made. Stage = rolling sum over the last 3 closed days: **<3 Новичок, 3–8 Друг, ≥9 Мастер**. Recomputed at every day close; any change shows a kid-worded explanation. Visuals faked programmatically (scale/glow tint) — see the asset contract in §5.4.
- **Reactions/recovery (R9 slot):** no illness/death events in v1. Negative meters only cause sad pose + explanation + timed correction task. The doc's "unforeseen medical expense" exists solely as the Лекарство catalog item (event variant is stretch, §2.6).

### 2.3 Задания (R8)

**Карта заданий** (2026-09-24, replaces the list): 9 lesson pins, 3 per topic (Савва's 6 lessons + 3 `comingSoon` placeholders — visible «⏳ скоро», never playable, not counted), 3 mini-games inside the «Покупки» sheet (`parent: "payments_shop"`, open when it is done), and the «Почини рюкзак» correction. How to add a lesson: `docs/CONTENT.md`. Each is a pin (`pin: {x, y, district}` in fractions of `assets/map/moscow.png`). Unlock is by completion only, no calendar gate: only budget #1 is open; finishing it opens #1 of savings and payments and budget #2; then each topic goes by `order`; `requires` overrides the chain (bonus games). Демо-режим opens every pin at once. Tapping a pin opens a sheet: topic, district, difficulty stars, description, «Награда: до N» or best result + «можно получить ещё N», «Начать» / «Пройти ещё раз» or «Откроется после «X»». Content is `assets/content/tasks.json` (§5.3); the map art is one PNG that Andrei's design replaces.

### 2.4 Взрослый раздел & Демо-режим (R12, R13)

- **Gate:** random two-digit × one-digit multiplication (e.g., 14 × 7); wrong answer → new question. Asked on every entry (session-scoped).
- **Contents:** learning progress (topics completed + overall, positive wording only) · Демо-режим toggle · profile reset/delete (extra confirmation, typed action) · Родительский бонус is **stretch** (§2.6).
- **Демо-режим:** toggled in Взрослый раздел; creates/switches to a dedicated demo profile (`isDemo = true`), pre-onboarded, with the manual clock; "Сбросить демо" restores its initial state; exit returns to the normal profile untouched. Must sustain **≥5 consecutive days** end-to-end (R13, Appendix A).

### 2.5 Первый запуск & help (R1, R11)

- Первый запуск opens with six static cards from `intro.json` (welcome, Цель, the three decision types, appearance, name, Стартовый бюджет), then Питомец → Имя. Cards 1–5 use «Дальше»; card 6 uses «Готово» and opens Питомец. Top row: back icon «Назад», progress bar, `1/6`…`6/6`. Back on card 1 leaves the app; later cards step back. No skip. The cards do not write a profile and do not grant coins. Appearance and the pet name remain an in-memory draft until valid Имя «Дальше»; that writes the Профиль ребёнка (leftover persistence `name` equals `petName`) and opens Main. Стартовый бюджет is granted in that write and has no feedback card. Closing the app before that write restarts at card 1. (ADR-0003)
- There is no «Как играть» walkthrough. The first Пособие card on Main is the ordinary feedback card: chip «Начало игрового дня», «Понятно», no dim, and it does not start a tour.
- Help re-access: Словарик is a button on Карта. Tab «Слова» is the 11 terms with kid definitions: Баланс, Копилка, Цель, Пособие, План, Обязательные расходы, Желаемые расходы, Сытость, Настроение, Этап, Игровой день (one-to-one with `CONTEXT.md`). Tab «Уроки» is the unscored cards of open уроки, with `{pet}` replaced, and no coins, questions, «скоро», or correction tasks. Closed уроки are absent. Демо-режим lists every playable урок. No replay button.

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
    screens/       # FirstRun, Main (Дом / Карта / Деньги), Shop, Results,
                   # Handbook, Plan, Savings, Bank, TaskRun, Adult, Settings
    components/    # PetView, MeterBar, CoinBadge, FeedbackCard, ConfirmSheet…
    theme.ts strings.ts   # RU strings; spacing/type scale ≥16 sp
assets/
  content/         # catalog.json tasks.json terms.json
  pets/            # designer drop — contract in §5.4
docs/
```

### 3.1 Navigation map

`FirstRun (six cards → Питомец → Имя) → Main`. The first Пособие card is ordinary «Понятно» and does not start a walkthrough. Main is a three-tab shell (ADR-0004): Дом, Карта, Деньги. A fresh launch opens Дом with Деньги on Копилка. While the app stays open it keeps the current tab and the current Деньги choice. The bottom bar is only those three roots; pushed screens hide it. Android Back pops one screen; from Карта or Деньги with nothing pushed it opens Дом; from Дом with nothing pushed it leaves the app. Screen-by-screen specifications and flows: §4.

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

Catalog tap → item sheet (price, category, pet impact estimate) → confirm → `core/economy` validates balance (else blocked screen: what's missing + options: wait for Пособие, do a Задание, «Сделать целью» for a Желаемое / «Отложить» for an Обязательное) → debit → transaction + purchase rows → meter event → FeedbackCard: «Баланс −12 · Сытость +10 · причина и следующий шаг». Buying the active Цель from Копилка is a separate intent: pot − price, purchase + item meter, Баланс unchanged.

## 4. Design flow — screens

Written for 360 dp portrait, RU copy, ages 7–11. Conventions for every screen: an empty/disabled state always explains what to do next (no dead ends); every verdict/status is icon + text (never color alone); destructive actions are double-confirmed; every coin/meter movement ends in a FeedbackCard.

**Chrome (all current child-facing screens):** cream/orange FinPet identity, system font, Russian sentence case. Shared kit: Screen, Card, raised PrimaryButton (darker bottom edge; depresses on press; disabled = flat grey), TextButton, Chip (visible check + `aria-selected`), SpeechBubble, Badge, NavTile (pictogram + word), PetView, MeterBar, BackButton labelled «Назад». Type scale: title / section / body / button; body ≥16 sp. Linear flows (Первый запуск) pin the primary action at the bottom; Дом is one scrolling page above the tab bar. Do not import streak/hearts/XP, a lesson path, an owl mascot, or green-as-success-only.

### 4.1 Screen map

```
Launch
 ├─ first run ──→ FirstRun [cards → Питомец → Имя] ─→ Main ─┐
 └─ returning ──────────────────────────────────────────────────→ Main ◄─────┘

Main ── bottom bar: Дом · Карта · Деньги
 ├─ Дом ─────────→ pet, demo line, Пособие ribbon, Цель card, Итоги, Магазин
 │    Магазин ───→ Catalog ─→ ItemSheet ─→ Confirm ─→ FeedbackCard
 │                             └─ insufficient ─→ BlockedSheet ─→ «Выполнить задание» closes Магазин and shows Карта
 │    Итоги ─────→ Results (last closed day + overall counts)
 ├─ Карта ───────→ TaskList (title «Карта заданий», no Back) ─→ TaskRun ─→ TaskResult ─→ Карта
 │    Словарик ──→ Handbook [Слова | Уроки]
 ├─ Деньги ──────→ dropdown «Раздел денег»: Копилка · План · Журнал · Банк
 │    Копилка ───→ Savings ─→ TransferIn / WithdrawPreview ─→ Confirm ─→ FeedbackCard
 │                             └─ pot ≥ price ─→ Celebration (Купить из копилки / Позже)
 │    План ──────→ Plan (draft → confirm → plan-vs-actual)
 │    Банк ──────→ after savings_where; always in Демо-режим
 └─ ⚙ Настройки ─→ version · «Взрослый раздел» → AdultGate ─→ Adult (progress · demo toggle · reset)
```

### 4.2 Screen specifications

**1–2. FirstRun.** *Purpose:* let the child make the pet theirs before the live hub is explained, without writing a partial profile (R1, R2). One controlled journey opens with six static cards, then owns an in-memory draft through phases Питомец and Имя. *Cards:* title and body from `intro.json`, in order welcome → goal → decisions → appearance → name → budget. Top row is a back icon whose accessible name is «Назад», then a progress bar filled to the current card out of 6, then the text `1/6`…`6/6`. Cards 1–5 pin «Дальше»; card 6 pins «Готово», which opens Питомец. Back on card 1 leaves the app the same way Android Back does; later cards return to the previous card. No «Пропустить». The cards grant nothing and write nothing. *Питомец:* a complete default pet is selected; live preview plus bead sliders for «Вид» (3), «Окрас» (3), and «Аксессуар» (3); the selected stop is the accent bead in its circle, not a Chip check. *Имя:* no on-screen title; compact speech cloud above a centered pet, tail pointing down; the cloud is «Меня зовут» plus a name-tag chip (placeholder «____», trailing pencil pictogram, accessible name «Меня зовут») that accepts 1–20 visible characters after trimming; «Дальше» stays disabled until that name is valid; disabled primary is flat grey. Visible and Android Back traverse the draft without losing choices; Back from Питомец may exit and does not return to the cards. Reopening before the profile exists restarts at card 1 and discards the draft. Valid Имя «Дальше» atomically creates the profile (leftover persistence `name` equals `petName`, both the trimmed pet name), then leaves for Main; on failure the draft remains and «Не получилось начать игру. Попробуй ещё раз.» offers retry. No profile row is written earlier. On «Имя», TalkBack names the chip «Меня зовут» and the pet image describes appearance without a name.

**Как играть.** Removed. Do not restore a spotlight walkthrough or a Словарик replay. The six opening cards are the intro.

**3. StartingBudget.** Removed as a grant screen. The +100 grant still happens inside profile creation, with no feedback card. The sixth opening card introduces Стартовый бюджет before Питомец.

**4. Main (three tabs).** *Purpose:* the pet, the map, and the money tools each have one place (R3, ADR-0004). The status strip is the compact Сытость and Настроение meters (icon + bar, numbers in the accessible name), Баланс, Этап, and ⚙ «Настройки». There is no second pair of chunky bars, no active-Задание card, and no «Закончить день». *Дом, top→bottom under the strip:* large centered pet; «Демо: дни идут подряд» when Демо-режим; Пособие ribbon when that visit credited it (same profile); Цель card (name, accumulated/cost, remaining — display only); «Итоги»; «Магазин». A FeedbackCard for Пособие or a вклад that came due covers Дом only on the open that credits them. *Карта:* title «Карта заданий», no Back, «Словарик» in the title row. *Деньги:* dropdown trigger «Раздел денег» with Копилка, План, Журнал, and Банк (Банк hidden until `savings_where`, always present in Демо-режим). Cold start and a fresh provider open Копилка. The last choice is remembered while the app stays open; a locked Банк falls back to Копилка. Switching the dropdown drops an unfinished confirm; a saved План draft stays. The closed control shows the current section and a dropdown arrow. The open list is its own panel, and the current section is the marked row. *Waiting day:* banner «Новый день откроется завтра» on Дом after the pet and the demo line, Магазин disabled, and План / Копилка / Банк show «Откроется завтра» and take no coins. Журнал, Карта, Словарик, and Итоги stay usable. Демо-режим never waits.

**5. Plan (План).** Embedded in Деньги: no Back and no own status strip. While the day is closed the body is the title plus «Откроется завтра» and the steppers are absent. *Purpose:* promise today's split across 3 areas without moving coins (R5). *Zones:* «Сегодня пришло: +N» (today's income: Пособие, Задания; day 1 includes Стартовый бюджет); available amount header (balance incl. today's Пособие); promise line «Это обещание на сегодня. Монеты пока в Балансе.»; card «Счета на сегодня» (optional note, e.g. «Питомец простыл…», and «Обед 12 · Проезд 8 = 20»; if Баланс < Счета, «На все счета не хватает N…»); three bucket rows in decision order — Обязательные, Копилка, Желаемые — each with the integer, a horizontal track 0…available, −/+ (tap ±1, hold repeats), and a pictogram; Обязательные start at today's Счета on a fresh draft and cannot go below them («Обязательных не меньше N — это счета.»; floor clamped to Баланс); Копилка extra «Положишь их отдельно — в Копилке.» plus a live Цель forecast («Скейтборд: накопишь через N дней, если откладывать столько каждый день.» / «Если ничего не отложить, Скейтборд не станет ближе.»); Желаемые hint «Хватит на: …» (cheapest-first items that fit); on later days a draft-only «вчера N» per row from last closed actuals (purchases / `savings_in`), including «вчера 0»; remainder line «Останется свободных: N»; validation line when total > available (blocks confirm); Обязательные below Счета also blocks confirm; «Подтвердить план». After confirm, leftover follow-through is on Магазин (open tab) and Копилка home, not on this screen, Main, or the status strip. *States:* draft (editable; yesterday hint when a closed day exists) → confirmed (locked; confirmation sheet repeats that this is a promise: coins stay in Баланс until Магазин / Копилка, then the plan cannot change; no yesterday; no track) → during-day view adds plan-vs-actual columns (план / потрачено per bucket) → day closed (title and «Откроется завтра» only). *Leaves:* the Деньги tab.

**6. Catalog (Магазин).** *Purpose:* purchases with informed consent (R6). *Zones:* tabs «Обязательное» / «Желаемое» (pictogram + label); with a confirmed План, one leftover line under the tabs for the open tab («Осталось N» or «сверх плана N»); item cards: name, price, category icon, pet-impact preview (meter icon + «+10»), «после покупки: N монет»; `once` Желаемые (Скейтборд, Телескоп, Велосипед) also show «Можно купить один раз» and leave the tab after any purchase; tap → ItemSheet (full description + «Сделать целью» when settable + «Купить» from Баланс; if this is the Цель and pot ≥ price, also «Купить из копилки»; Баланс «Купить» of the current Цель warns that the Цель clears and the pot stays). *States:* purchased today → card badge «Куплено» (rebuyable rows); owned `once` rows are omitted, not greyed; buy confirm with a confirmed План always shows «в плане останется N» for that item's bucket after this price and, if that after-value is < 0, «Это сверх плана.» without disabling Купить (Копилка-paid buys skip that leftover); insufficient funds → BlockedSheet: «Не хватает N монет» + options (дождаться Пособия · выполнить Задание · for a Желаемое «Сделать целью», or dismiss-and-point-at-Копилка if it already is the Цель · for an Обязательное «Отложить») — no purchase happens, and leftover math is not a second block. Unconfirmed / no plan: omit leftover. *Leaves:* confirm → FeedbackCard (§3.3).

**7. Savings (Копилка).** Embedded in Деньги: no Back and no own status strip. The pot number lives here. While the day is closed the body is the title plus «Откроется завтра» and the coin controls are absent. *Purpose:* savings & goals (R7). *Zones:* pot total large; with a confirmed План, one leftover line for the Копилка bucket («Осталось N» or «сверх плана N»); active-Цель card (catalog name, cost, accumulated, remaining, date estimate «—» until first transfer) plus «Выбери цель» (one picker of settable Желаемые, drop to none; pot unchanged on drop or switch); «Положить» → TransferIn sheet (stepper ≤ balance, confirm; with a confirmed План also «в плане останется N» after this deposit and, if < 0, non-blocking «Это сверх плана.»); «Забрать» → WithdrawPreview (pot after, «мечта отодвинется на N дней», separate confirm; no plan leftover; allowed with no Цель). *States:* pot ≥ price → Celebration («Мечта сбылась!», «Купить из копилки» / «Позже»; coins stay, Настроение unchanged); after Позже the Цель stays funded; «Купить из копилки» (here or on the Магазин sheet) deducts the price from the pot, records the purchase, clears the Цель, then FeedbackCard (item meter, Копилка delta) and a button «Выбрать новую цель»; do not force the picker after Позже or drop. Unconfirmed / no plan: omit leftover. *Leaves:* FeedbackCard on deposit, withdrawal, and buy; picker anytime.

**8. TaskList (Карта заданий).** The Карта tab. No Back. «Словарик» sits in the title row and opens the handbook. *Purpose:* learning content entry (R8). *Zones:* three topic groups (Бюджет, Копилки, Платежи) × 2 cards each: title, topic icon, reward badge «+10» if unclaimed, completed badge. Mini-game buttons stay on a pin. *States:* locked → «Откроется: завтра» (normal play) / all open (Демо-режим); completed → replayable, no reward. *Leaves:* TaskRun.

**9. TaskRun.** *Purpose:* play one Задание node by node. *Zones:* node text (scene), pet pose reacting to the last verdict, option buttons (≥48 dp), after a tap: verdict banner (✅/🤔/⚠️ icon + word) + explanation panel + «Дальше». `retry` returns into the same node (correction path); `spawnTask` shows «Новое задание появилось в списке!». *Leaves:* TaskResult.

**10. TaskResult.** *Zones:* outcome summary, «+10 монет» if first correct completion, «На карту». *Leaves:* Main on the Карта tab.

**11. Record, journal, handbook.** Прогресс is not a screen (ADR-0004). *Итоги* is a pushed screen from Дом and can be opened again: last closed day (score, plan-vs-actual, meter reasons, stage explanation when one exists) plus overall counts (days played, tasks done, «Целей: N»). Empty copy: «Итоги появятся после первого закрытого игрового дня.» This is distinct from Итоги дня, the end-of-day moment. *Журнал* is a Деньги section: chronological transactions grouped by day, and it stays usable on a waiting day. *Словарик* is the handbook on Карта, tabs «Слова» and «Уроки» (§2.5). No replay button.

**12. AdultGate.** *Purpose:* adult gate (R12). *Zones:* «Сколько будет 14 × 7?» (random two-digit × one-digit), numeric input, «Войти». *States:* wrong → new question (after 2 attempts), no hints. *Leaves:* Adult.

**13. Adult (Взрослый раздел).** Reached from Настройки in every build, behind the same arithmetic gate. There is no hub tile and no delete button on Настройки. *Zones:* progress overview (topics completed, days played — positive wording only); Демо-режим toggle (on → confirm sheet «Демо создаёт отдельный тестовый профиль»; off → returns to normal profile); «Сбросить демо»; «Сбросить прогресс» / «Удалить профиль» with typed confirmation. *States:* stretch — Родительский бонус card (§2.6). *Leaves:* Main / demo Main.

**14. DaySummary (Итоги дня).** The end-of-day moment screen stays in the navigator. Nothing in the shell navigates to it, because nothing closes a day. The reopenable record is Итоги (§11). When a close control exists, this screen is the plan-vs-actual table, the day score, meter reasons, a stage explanation when the stage changed, and «Ждём завтра!» (normal) / «Следующий день» (demo).

**15. Settings (⚙).** *Zones:* app name and version; «Взрослый раздел» in every build. Opened from the play-screen strip ⚙ (accessible name «Настройки»). *Leaves:* Main, or AdultGate.

**16. FeedbackCard (component, centered sheet).** *Zones:* delta rows with icons (Баланс ±N · Копилка ±N · Сытость ±N · Настроение ±N); a full-screen tap-catch so the hub behind is inert. Пособие uses chip «Начало игрового дня» (never «награда») instead of a «потому что» sentence. Every card, including the first Пособие, confirms with «Понятно» and does not dim the hub. Purchase / savings / task cards keep cause + next-step lines. Every row is also appended to Журнал. Used after: grant, Пособие, purchase (Баланс or from Копилка), blocked purchase (variation), transfer, withdrawal, task reward, parent bonus (stretch). Reaching the Цель price is Celebration only — no FeedbackCard and no Настроение row until the item is bought.

### 4.3 Key flows

- **First launch (Appendix A 1–4):** Launch → six opening cards → FirstRun Питомец → Имя (profile created) → Дом → ordinary Пособие «Понятно». Force-quit before profile creation discards the draft and restarts at card 1. Force-quit after Имя reopens Дом with no walkthrough.
- **Day loop (normal & demo):** day opens on entering Main after unlock → Пособие +20 via FeedbackCard → Plan confirmed from Деньги → free play (Магазин / Карта / Копилка; plan-vs-actual live on Plan). Nothing in the shell closes a day. After a day has closed, normal play waits until the next calendar morning (banner on Дом, Магазин disabled, План / Копилка / Банк frozen); Демо-режим opens the next day on the next visit to Main. Журнал, Карта, Словарик, and Итоги stay available. The stored record is Итоги.
- **Insufficient funds (Appendix A 7):** Магазин → buy Игрушка (25) at balance < 25 → BlockedSheet (needs N more; options) → a way out exists in-app (Задание now, Пособие tomorrow, or «Сделать целью»).
- **Savings withdrawal (R7):** Копилка → «Забрать» → amount → WithdrawPreview (pot after, date shift) → separate confirm → FeedbackCard.
- **Correction path / safe error (R9):** bad verdict or skipped mandatory item → meter drop + sad pose + explanation + `spawnTask` correction Задание or next-day plan-adjust hint; progress is never reset.
- **Demo walkthrough (Appendix A 12):** Дом → Настройки → Взрослый раздел → AdultGate → demo toggle → demo Дом (fresh test profile, all tasks open, days back-to-back, «Демо: дни идут подряд») → ≥5 back-to-back days → «Сбросить демо» restores initial state → exit returns to the normal profile.
- **Persistence (Appendix A 11):** every mutation writes through to SQLite immediately; kill & relaunch lands on Main with profile, balance, purchases, savings, goal, and learning progress intact.

## 5. Content contracts

### 5.1 `catalog.json`

```json
{ "contentVersion": 1, "items": [
  { "id": "lunch", "name": "Обед", "kind": "mandatory", "price": 12,
    "effect": { "meter": "care", "delta": 10 },
    "description": "Питомцу нужно есть каждый день" },
  { "id": "skateboard", "name": "Скейтборд", "kind": "optional", "price": 90,
    "effect": { "meter": "mood", "delta": 12 },
    "description": "Кататься во дворе после школы", "once": true } ] }
```

Eleven items. Optional boolean `once` defaults false; true only on Скейтборд, Телескоп, Велосипед. Candy-tier stays rebuyable. A Цель is a catalog Желаемое id, not a separate content list.

### 5.2 `terms.json`

Catalog optional rows are the only Цель source (`id`, `name`, `cost` = price, `description`; `once` as above). Do not restore a parallel `goals.json` presets file. Terms: the 11 glossary entries including План. Do not restore `hint.json` or a «Как играть» overlay. `intro.json` is the six opening cards (`welcome`, `goal`, `decisions`, `appearance`, `name`, `budget`), each with `title` and `body`. Shipped strings are placeholders.

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

Node kinds: `choice` (default — `text` + `options`), `card` (`title?`, `text`, `next`, `button?` — teaching card, not scored), `sort` (`text`, `bins`, `items: [{label, bin, explanation}]`, `next` — «Нужно или хочется?»-style game; each item scored on its first answer, a wrong basket retries the item). Mission fields: `order`, `difficulty` 1–3, `description`, `pin`, optional `requires`. `{pet}` in any text is replaced with the pet's name. The loader rejects dangling `next` / `spawnTask` / `requires` and a map mission without pin/order.

Rules: every option carries `explanation` (shown after the action, regardless of verdict — R8); `verdict` renders icon+text, never color-only (`UX`); `retry` = correction path back into the same node; `spawnTask` enqueues a timed correction Задание (safe-error rule, R9); runner is generic — a new task is data only.

### 5.4 Designer asset drop — `assets/pets/` (expected contract)

```
pets/sp{1|2|3}/c{1|2|3}/
  idle.png  happy.png  sad.png        # base poses, transparent PNG
pets/overlays/a{1|2|3}.png            # accessory, transparent PNG, centered
```

PetView layers base pose + accessory overlay; stage fake = reanimated scale/glow per Этап; pose switches tweened. Until assets arrive, ship gray placeholder PNGs with the same names so all screens work.

Current drop (2026-09-22): Andrei's sheets live in `design/pets/sp{N}-c{N}-<colour>.png` (32 px grid, 15 × 8 cells: rows are animations). `node scripts/slice-pet-sheets.mjs` cuts one frame per pose (idle r0c0, happy r1c11, sad r4c8) into the tree above, scaled ×8 nearest-neighbour to 256 px so PetView downsizes crisp pixels. Delivered: sp1 (cat) and sp2 (hood) × c1 grey / c2 orange / c3 green. **Missing:** sp3 art (still gray placeholders) and accessory overlays — `overlays/a*.png` are transparent 256 px until the hats arrive; they must be drawn on the same 32 px cell so they line up with the body.

## 6. The six Задания — full scripts (RU copy)

Verdicts: `good` ✅ / `warn` 🤔 / `bad` ⚠️ — always with icon, text, and explanation.

### 6.1 «Первый план» — budget_first_plan
Intro: «Сегодня школьная ярмарка! У питомца нет обеда, а ты хочешь мороженое. У тебя 20 монет.»
- **N1 «С чего начнёшь?»**
  - ✅ «Купить обед (10)» → Сытость +5 → N2. «Обязательные расходы — самое важное. Сначала нужды, потом мечты.»
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
  - ⚠️ «Сначала яйцо» → **spawnTask «Почини рюкзак»** → exit. The answer does not move Сытость or Настроение. «Обязательный ремонт нельзя пропускать. Вот задание, чтобы всё исправить.»
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
- **M2 — Первый запуск, pet, shell (Days 2–4).** Screens per §4.2 #1–4: FirstRun state machine (six opening cards → 3×3×3 pet customization → «Имя» for the Питомец only → atomic profile creation); Стартовый бюджет granted at profile creation with no feedback card; three-tab Main (Дом, Карта, Деньги) with the strip meters and the Цель card; Словарик on Карта and no walkthrough.
  *AC:* Appendix A steps 1–4 passable end-to-end on device.
- **M3 — Economy loop UI (Days 4–6).** Screens per §4.2 #5–7, 11, 16: План (3 buckets, total ≤ available, remainder shown, editable until confirmed, plan-vs-actual); Магазин (catalog, pre-purchase sheet, confirm, insufficient-funds block with options); Копилка (one catalog Цель, deposits that fund without spending, buy from pot, withdrawal with double confirm + before/after + date shift); Журнал; FeedbackCard on every coin/meter movement.
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

**Automated (jest, `src/core` + repositories):** plan validation (sum ≤ available; draft editable; confirm locks); debit (over-balance rejected, never negative, transaction+history written); savings (in/out, withdrawal gated by confirm, deposit funds without spending the pot, buy-from-Копилка, date estimate monotone under new deposits); stages (+2/+1/+1 day score, rolling-3 window, thresholds 3/9, explanation emitted on change); days (next-calendar-day unlock via fake Clock; ManualClock back-to-back); persistence (schema roundtrip; balance invariant).

**Manual scripted (documented in `docs/test-cases.md`):** Appendix A steps 1–12 as named cases (screen sequence per §4.3 flows); low-end Android 8.0 emulator + one mid-range physical device; airplane mode (offline invariant); font-size 1.3× legibility; demo reset; relaunch persistence; insufficient-funds staging (buy Игрушка at low balance → BlockedSheet shows options).

**Test report:** `docs/test-report.md` filled at M6, listing each case × device × result.

## 9. Requirements traceability

| Req | Where settled/implemented |
|---|---|
| R1 first run | §2.5 · §4.2 · M2 |
| R2 pet creation, 9+ combos | §2.2 (27) · §5.4 · M2 |
| R3 main screen contents | §2.2 · §3.1, §4 · M2 |
| R4 currency/income | §2.1 · §3.3 · M1, M2 |
| R5 budget planning | §2.1 day rules · §4.2 · M3 |
| R6 purchases (11 items) | §2.1 catalog · §4.2 · M3 |
| R7 savings & goals | §2.1 Цель · §4.2 · M3 |
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
