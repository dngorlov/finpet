# FinPet (ФинПет)

A single-context project: an offline Android game that teaches kids 7–11 basic money skills by caring for a virtual pet. The UI language is Russian; canonical terms below are the Russian strings used in the app, with English glosses.

## Language

### Profiles & modes

**Первый запуск (First run)**:
The one-time journey in which a child creates a Профиль ребёнка.
_Avoid_: онбординг, туториал, обучение

**Профиль ребёнка (Child profile)**:
A local game identity: the child's Питомец (its name and appearance). No account, no personal data.
_Avoid_: аккаунт, регистрация, пользователь, имя игрока, game name

**Демо-режим (Demo mode)**:
An isolated test profile that walks the mandatory game loop through consecutive Game Days without waiting for real dates, resettable to its initial state.
_Avoid_: тестовый аккаунт, отладка

**Взрослый раздел (Adult section)**:
The area for adults, protected by an arithmetic gate: learning progress, Parent bonus, Demo mode toggle, Удалить профиль.
_Avoid_: родительский контроль (a prohibited feature), родительские настройки

**Удалить профиль (Delete profile)**:
A Профиль ребёнка taken off the device — that pet, its Игровые дни, and its money are gone. Первый запуск starts again.
_Avoid_: clear storage, wipe, reset app, сброс приложения, сбросить демо

**Родительский бонус (Parent bonus)**:
Extra coins a parent awards at most once per Game Day from the Adult section, with an optional reason.
_Avoid_: награда, подарок

### Economy

**Игровой день (Game Day)**:
One cycle of the game economy: plan → income → purchases → savings → feedback. In normal play a new Game Day unlocks on the next calendar day; in Demo mode days follow back-to-back.
_Avoid_: период, уровень, сессия

**Баланс (Balance)**:
Coins available to spend right now.
_Avoid_: кошелёк, счёт

**Стартовый бюджет (Starting budget)**:
The coins granted once when a Child profile is created.
_Avoid_: приветственный подарок

**Пособие (Allowance)**:
The recurring income credited once per Game Day just for showing up.
_Avoid_: ежедневный доход, логин-бонус

**План (Plan)**:
The day's promised split of available coins into Обязательные, Желаемые, and Копилка — a promise, not a coin movement. A Закрыто План lets the Игровой день end with no promise; an open one still waits for confirmation.
_Avoid_: бюджет, бронь, список покупок

**Итоги дня (Day summary)**:
The end-of-day screen: plan vs. actual, the day's score, and meter/Этап changes with explanations.
_Avoid_: отчёт, дневник

**Обязательные расходы (Mandatory expenses)**:
Purchases the pet needs (food, school supplies, transport, medicine). Skipping today's Счета hurts Забота, unless Магазин is Закрыто.

**Счета (Day bills)**:
The mandatory items due on a given Game Day, from a fixed content cycle. The План's Обязательные cannot be set below them, unless Магазин is Закрыто.
_Avoid_: список обязательных, долги, нужное, необходимое

**Желаемые расходы (Optional expenses)**:
Non-essential purchases that lift Настроение. Some (today: Скейтборд, Телескоп, Велосипед) can only be bought once and then leave Магазин.
_Avoid_: приятное, хотелки

**Три решения (The three decision types)**:
What the game teaches to weigh before any purchase: spend on mandatory, spend on optional, or postpone.
_Avoid_: выбор ответа

**Магазин (Shop)**:
The catalog of Обязательные and Желаемые the child can buy this Игровой день.
_Avoid_: витрина, инвентарь

**Копилка (Savings)**:
The pot of coins set aside from Баланс toward the Цель. Coins leave it only by confirmed withdrawal or by buying that Цель. While Копилка is Закрыто, a План's deposit stays at 0.
_Avoid_: накопления, депозит, вклад

**Банк (Bank)** / **Вклад (Deposit)**:
Separate from Копилка and opened after the lesson «Где живут накопления?»: a вклад takes coins out of Баланс for a fixed number of Игровые дни and returns them with interest when the term ends. No early withdrawal.
_Avoid_: депозит, счёт, копилка (for the bank)

**Цель (Goal)**:
The one Желаемое from Магазин that Копилка is accumulating toward. There is at most one at a time; Обязательные cannot be a Цель.
_Avoid_: ачивка, мечта, произвольная цель

### Pet

**Питомец (Pet)**:
The virtual creature whose state reflects the child's financial decisions. It may speak fixed, scripted guidance but does not answer questions.
_Avoid_: герой, аватар

**Вид (Species)**:
One of the three pet species from the designer's art; appearance = Вид + Окрас + Аксессуар.
_Avoid_: порода, тип

**Окрас (Color)**:
The pet's color variant — one of the three designer colors.
_Avoid_: цвет, окрас кожи, skin

**Аксессуар (Accessory)**:
The extra item the pet wears — one of the three designer accessories.
_Avoid_: украшение, шапка, hat

**Забота (Care)**:
The pet meter fed by buying Обязательные расходы on time.
_Avoid_: здоровье, сытость

**Настроение (Mood)**:
The pet meter fed by Желаемые расходы.
_Avoid_: счастье, радость

**Этап (Stage)**:
The pet's development level — Новичок, Друг, Мастер — recalculated from recent closed days the child could score. A day with no reachable score points stays outside that reckoning.
_Avoid_: уровень, эволюция

### Learning

**Закрыто (Locked)**:
План, Магазин, Копилка, or Задания withheld on the child's profile until later play opens it. Withholding covers every entrance and creates no obligation; Демо-режим never withholds them, and opening Прогресс does not open them.
_Avoid_: уровень, туториал, квест

**Помощник (Helper)**:
An optional, kid-visible chat assistant on the main screen that answers money questions in kid language. Never required for the game loop.
_Avoid_: чат-бот, ИИ-друг

**Задание (Task)**:
A financial-literacy mission on the Карта заданий: teaching cards, then a mini-game or questions with choices and consequences; every answer gets a short explanation. Coins scale with first-try answers; a replay pays only the improvement.
_Avoid_: квест, тест (content may call its theory part «урок»)

**Карта заданий (Mission map)**:
The map of Moscow districts where each Задание is a pin. Only the first budget Задание is open at first; finishing it opens the first Задание of every other topic and the next budget one; after that each topic goes in order.
_Avoid_: список заданий, уровни

**Журнал (History)**:
The in-app record of income, purchases and savings transfers for the current Game Day plus results of past days.
_Avoid_: лог, отчёт

**Словарик (Glossary)**:
The short help section explaining key terms in kid language.
_Avoid_: справка, FAQ, Как играть
