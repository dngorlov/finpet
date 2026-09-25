# Three-tab play shell

## Status

accepted

## Context & decision

The play shell was one hub: a grid of equal tiles (План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел) plus a «Закончить день» button. We replaced that grid with a bottom bar of three tabs — Дом, Карта, Деньги — so the pet, the map, and the money tools each have one place. «Деньги» is a tab label only. Its dropdown is Копилка, План, Журнал, and Банк. Магазин and Итоги stay on Дом, Словарик stays on Карта, and Взрослый раздел moves into Настройки behind the same arithmetic gate.

## Considered options

- **Keep the hub grid**: everything visible at once, which the earlier roadmap asked for. Rejected: the grid had become a menu of peers, and the pet was competing with it.
- **One tab per destination**: План, Копилка, Журнал, and Банк would each take a slot. Rejected: those four are one money area, and the bar would not fit a child's thumb.

## Consequences

- Карта is the short name of Карта заданий. Прогресс is no longer a screen: Итоги is the reopenable record on Дом, Журнал lives under Деньги, and Словарик is the handbook on the map.
- «Закончить день» is gone. ADR-0002 still stands: a normal Игровой день unlocks on the next calendar morning, and Демо-режим runs days back-to-back. No child control closes a day until the mission rule is specified.
- The roadmap and requirements describe this shell. ADR-0002 is unchanged.
