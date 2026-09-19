# FinPet (ФинПет)

A single-context project: an offline Android game that teaches kids 7–11 basic money skills by caring for a virtual pet. The UI language is Russian; canonical terms below are the Russian strings used in the app, with English glosses.

## Language

### Profiles & modes

**Первый запуск (First run)**:
The one-time journey in which a child creates a Профиль ребёнка and learns how to begin playing.
_Avoid_: онбординг (ambiguous: may mean only the «Как играть» cards)

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

**Итоги дня (Day summary)**:
The end-of-day screen: plan vs. actual, the day's score, and meter/Этап changes with explanations.
_Avoid_: отчёт, дневник

**Обязательные расходы (Mandatory expenses)**:
Purchases the pet needs every Game Day (food, school supplies, transport); skipping them hurts Забота.
_Avoid_: нужное, необходимое

**Желаемые расходы (Optional expenses)**:
Non-essential purchases (candy, stickers, cinema, toys) that lift Настроение.
_Avoid_: приятное, хотелки

**Три решения (The three decision types)**:
What the game teaches to weigh before any purchase: spend on mandatory, spend on optional, or postpone.
_Avoid_: выбор ответа

**Копилка (Savings)**:
The pot coins are transferred into and can only leave from with a separate confirmation that shows the impact on the Goal.
_Avoid_: накопления, депозит, вклад

**Цель (Goal)**:
A named purchase target with a fixed cost that Копилка accumulates toward.
_Avoid_: ачивка, мечта

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
The pet meter fed by Желаемые расходы and progress toward the Цель.
_Avoid_: счастье, радость

**Этап (Stage)**:
The pet's development level — Новичок, Друг, Мастер — recalculated from decisions across recent Game Days.
_Avoid_: уровень, эволюция

### Learning

**Как играть (How to play)**:
A brief, replayable explanation of the game in which the child's Питомец speaks scripted guidance.
_Avoid_: онбординг, Помощник

**Помощник (Helper)**:
An optional, kid-visible chat assistant on the main screen that answers money questions in kid language. Never required for the game loop.
_Avoid_: чат-бот, ИИ-друг

**Задание (Task)**:
A financial-literacy scenario with choices and consequences; every action gets a short explanation.
_Avoid_: урок, квест, тест

**Журнал (History)**:
The in-app record of income, purchases and savings transfers for the current Game Day plus results of past days.
_Avoid_: лог, отчёт

**Словарик (Glossary)**:
The short help section explaining key terms in kid language; also where «Как играть» can be replayed.
_Avoid_: справка, FAQ
