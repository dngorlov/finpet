# A pinned lesson ends the Игровой день

## Status

accepted

## Context & decision

ADR-0002 tied a normal Игровой день to the next calendar morning, let Демо-режим run days back-to-back, and left unspecified how a Задание would close a day. We reversed the clock. A profile starts on day 1, already open. The first completion of a pinned Урок closes that day; the next day begins when the child leaves Итоги дня. Демо-режим uses the same rule. The calendar does not open a day. The map's prerequisite chain is unchanged, and a day number never locks a pin.

## Considered options

- **A separate day counter on Дом**, leaving the economic day on the calendar. Rejected: Пособие, Счета, Вклад, and Этап would follow a different clock from the number under the pet.
- **One global lesson sequence.** Rejected: after the first budget Урок the map opens several pins, and any one of those open pins may end the day.
- **Midnight as a second way to open a day.** Rejected: a day would then start in two different ways.

## Consequences

- A replay, a mini-game, or a correction does not end a day. On a day-ending completion the lesson result leads to Итоги дня; those other finishes still return to Карта.
- Пособие, Счета, вклад terms, Этап, and the Родительский бонус keep their formulas and now move once per lesson-day. The lesson's coins belong to the day that is closing.
- After the last playable pinned Урок, the next day opens and stays open.
- A closed day with no successor is only Итоги дня, including when the app is opened again in that state. Дом shows the open day's number under the Питомец.
- ADR-0002's calendar unlock and demo manual clock are retired. The demo profile stays a separate resettable row, and it follows the same Карта chain.
