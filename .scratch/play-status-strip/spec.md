# Pinned play-screen status strip

Status: ready-for-agent

## Problem Statement

On Main, Этап, Баланс, Копилка, Настройки, Забота, and Настроение live in the scrolling hub. The ребёнок loses them as soon as they open План, Магазин, or Копилка. Копилка’s pot competes with Баланс in the same badge row, Настройки is a labelled text control in the middle of the page, and Этап is a word badge instead of the three-stop Новичок → Друг → Мастер row.

## Solution

A compact status strip is pinned above the scrolling page on child play screens. Left to right: Забота (icon + bar), Настроение (icon + bar), Баланс (🪙 + number), Этап (three DVD dots then the current name), Настройки (⚙ only). The strip does not scroll away. Копилка leaves the strip; its pot is a second line on the Main Копилка tile and stays the large pot line on the Копилка screen. Main still shows the full Забота / Настроение bars under the pet. Назад stays in the page under the strip. While «Как играть» is up, the strip is hidden so the overlay chrome is the only top bar.

## User Stories

1. As a ребёнок on Main, I want a pinned strip that does not scroll with the pet and tiles, so that Баланс and the meters stay in reach.
2. As a ребёнок on План, I want that same strip, so that I still see Баланс while I split the day.
3. As a ребёнок on Магазин, I want that same strip, so that I see Баланс before I look at a price.
4. As a ребёнок on Копилка, I want that same strip, so that spendable Баланс stays distinct from the pot.
5. As a ребёнок on the Задания list, I want that same strip, so that meters stay visible before I pick a Задание.
6. As a ребёнок on Прогресс, I want that same strip, so that current Этап and Баланс sit above Журнал and Словарик.
7. As a ребёнок on Итоги дня, I want that same strip, so that the new Этап dots match the day’s close.
8. As a ребёнок on Первый запуск, I do not want the strip, so that there is no fake Баланс before a Профиль ребёнка exists.
9. As a ребёнок on Стартовый бюджет, I do not want the strip, so that the +100 grant is the only money on that screen.
10. As a ребёнок on Настройки, I do not want the strip, so that a ⚙ does not sit on the settings page itself.
11. As an adult on the gate or Взрослый раздел, I do not want the strip, so that child meters are not chrome on the adult lock.
12. As a ребёнок inside TaskRun, I do not want the strip, so that the Задание scene is the only chrome.
13. As a ребёнок on TaskResult, I do not want the strip, so that the result stays a focused page like TaskRun.
14. As a ребёнок, I want the strip order Забота, Настроение, Баланс, Этап, Настройки, so that meters come before money and settings is last.
15. As a ребёнок, I want Забота in the strip as the 🐾 icon plus a short bar, so that it fits the row.
16. As a ребёнок, I want Настроение in the strip as the ☀ icon plus a short bar, so that it matches Забота.
17. As a ребёнок, I do not want the Забота / Настроение numbers painted in the strip, so that the row stays compact.
18. As a ребёнок, I do not want the words «Забота» / «Настроение» painted in the strip, so that those labels stay on Main’s full bars.
19. As a TalkBack user on План, I want the strip Забота control named `Забота 50` (current value), so that the hidden number is still spoken.
20. As a TalkBack user, I want the strip Настроение named `Настроение 50` (current value), so that the two meters do not collapse into one unnamed bar.
21. As a ребёнок on Main, I still want the chunky MeterBars (icon + label + bar + number) under the pet, so that Main keeps the full reading.
22. As a ребёнок, I want Баланс in the strip as 🪙 plus the number, so that spendable coins are one glance.
23. As a ребёнок, I do not want the word «Баланс» painted in the strip, so that the row stays compact.
24. As a TalkBack user, I want that amount named `Баланс 110`, so that the coin icon is not the name.
25. As a ребёнок, I want Этап as three same-size DVD dots, then the current name (Новичок / Друг / Мастер), so that I can read which stop I am on.
26. As a ребёнок at Новичок, I want the first dot green and the other two gray, so that later Этапы are clearly ahead.
27. As a ребёнок at Друг, I want the first two dots green and the last gray, so that Новичок stays earned.
28. As a ребёнок at Мастер, I want all three dots green, so that the row is complete.
29. As a ребёнок, I want current and earlier dots the same green (no extra ring required), so that the word — not a second mark — names the current stop.
30. As a TalkBack user, I want Этап announced as `Этап Новичок` (or Друг / Мастер), so that dots are not “graphic 2 of 3”.
31. As a ребёнок, I do not want the word «Этап» painted next to the dots, so that only the current name sits there.
32. As a ребёнок, I want Настройки as a ⚙ on the right of the strip, so that the old mid-page text button is gone.
33. As a TalkBack user, I want that ⚙ named «Настройки», so that I can still open it without a visible word.
34. As a ребёнок, I want that ⚙ at least 48 dp, so that it is a real target.
35. As a ребёнок tapping ⚙, I want Настройки, so that the destination does not change.
36. As a ребёнок, I do not want Забота, Настроение, Баланс, or the Этап dots to be buttons, so that I do not wander into Прогресс or Журнал by accident.
37. As a ребёнок on План, I want «Назад» still as a word under the strip in the scrolling page, so that leaving a screen is the same as today.
38. As a ребёнок during «Как играть», I do not want the status strip, so that overlay «Назад / Пропустить / Дальше» is the only top bar.
39. As a ребёнок after skip or finish of «Как играть», I want the strip back, so that Main is playable.
40. As a ребёнок, I do not want Копилка’s pot in the strip, so that Баланс is not confused with the pot.
41. As a ребёнок on Main, I want the Копилка tile to show the pot number on a second line, so that savings still sit on the hub without an extra tap.
42. As a TalkBack user, I want that tile still named «Копилка», so that the number is not a second button name.
43. As a ребёнок waiting for tomorrow, I want that tile to keep the lock and «Откроется завтра» and still show the pot, so that waiting does not hide what I already saved.
44. As a ребёнок on the Копилка screen, I still want «В копилке N», so that the pot is the headline there.
45. As a ребёнок on Main, I still want the Цель card (name, accumulated/cost, remaining), so that the pot on the tile is not a substitute for the goal.
46. As a ребёнок after a purchase, I want the strip Баланс (and meters) to match the new numbers when the FeedbackCard is gone, so that the strip is not stale.
47. As a returning ребёнок, I want the strip on Main with the same numbers the hub already had, so that this pass does not invent economy.
48. As a ребёнок in Демо-режим on Main, I want the strip on that play Main, so that demo days use the same chrome.
49. As a разработчик, I want REQUIREMENTS Main / ROADMAP §4.2 Main updated for the pinned strip, Копилка-on-tile, DVD Этап, and ⚙-only Настройки, so that docs do not still require the scrolling badge row and a labelled Settings word.
50. As a разработчик, I want the chrome-kit stories that required Этап/Баланс/Копилка badges and a labelled Настройки word marked superseded, so that agents do not restore them.
51. As a разработчик, I do not want a new CONTEXT.md term for the strip, so that chrome stays out of the glossary.
52. As an accessibility reviewer, I want strip meters to stay icon + bar (not color alone) and Этап to keep a visible current name, so that green/gray dots are not the only Этап cue.
53. As a ребёнок, I want body text on Main’s full meters still ≥16 sp, so that compact strip chrome does not shrink the page bars.
54. As a хакатон judge, I want Appendix A still playable: first run, hub, План, Магазин, Копилка, Задания, Прогресс, adult gate.

## Implementation Decisions

- Scope is child-play chrome only. No schema, no economy, no FirstRun/Имя/Стартовый бюджет copy, no new glossary term, no ADR (pinning a strip is easy to reverse).
- Play screens that show the strip: Main, План, Магазин, Копилка, Задания list, Прогресс, Итоги дня. Hidden or absent: Первый запуск, Стартовый бюджет, Настройки, Adult gate, Взрослый раздел, TaskRun, TaskResult, and any moment `howToPlay` tour is active.
- Pin the strip above the scrolling Screen content (and above a page’s BackButton). It must not live inside the ScrollView. Safe-area top padding stays on the app chrome, not duplicated inside the strip if already applied.
- One shared strip reads the live Профиль ребёнка (Забота, Настроение, Баланс, Этап) so Shop/Plan/Savings see the same numbers after a write and a focus/update. Do not pass a frozen Main snapshot into other routes.
- Strip order is fixed: Забота, Настроение, Баланс, Этап, Настройки.
- Strip Забота / Настроение: existing meter icons + a shortened track; no painted label, no painted number. Accessible name is the existing meter line (`Забота N` / `Настроение N`). Not pressable.
- Main keeps the current chunky MeterBars under the pet (icon + label + bar + number). Duplicate on Main is required, not a bug.
- Strip Баланс: 🪙 + number, not pressable. Accessible name stays `Баланс N`. Do not paint the word «Баланс».
- Этап: three equal circles in Новичок → Друг → Мастер order. Filled green (`fill` token) for the current stop and every earlier stop; gray (`disabledFace` or track) for later stops. Current name as visible text after the dots. Accessible name `Этап` + current name. Not pressable. No extra ring required on the current dot.
- Настройки: ⚙ pictogram, minimum 48 dp, accessible name «Настройки», no visible word. Opens Settings. This overrides ROADMAP Main «⚙ remains a labelled control» and the chrome-kit labelled-Settings stories.
- Remove Main’s scrolling Badge row (Этап / Баланс / Копилка) and the mid-page «Настройки» TextButton.
- Копилка NavTile: keep pictogram + word; add the pot as a second visible line (the number). Accessible name remains «Копилка». When the tile is waiting, keep lock + «Откроется завтра» and still show the pot. Копилка screen keeps `В копилке N`. Do not put the pot on the strip. Leave the Цель card on Main.
- «Назад» remains the existing word BackButton as the first scrolling control on inner play screens. Do not move it into the strip.
- «Как играть»: hide the status strip for the whole overlay; do not restack overlay chrome under a second bar. After skip/finish, show the strip again.
- Update REQUIREMENTS §3 resolved hub layout and ROADMAP §4.2 Main (badge strip, labelled ⚙, meters-only-on-Main). Append a supersession note on chrome-kit / child-chrome-kit stories that required the Main badge trio and a visible Настройки word. Do not revert CONTEXT.md.
- Tests that look for concatenated `Копилка N` or `Этап Новичок` as a single Main text node must move to: Копилка tile + pot digits; `Этап …` as the accessible name and the current name as visible text.

## Testing Decisions

- A good test asserts what the ребёнок can see and do: which screens show the strip, TalkBack names, ⚙ opens Настройки, Копилка tile still named «Копилка» with a visible pot, full Main meter lines still present, overlay tour hides the strip, Назад still leaves План. It does not assert dot diameter, bar length, ⚙ glyph code point, or pin CSS.
- One behavior seam: the existing navigation-root first-run flow suite. It already reaches Main, the tour, План/Магазин/Копилка, Settings, and skip. Prefer it over a new per-strip test file.
- RNTL v14: async `render`, `screen`, `userEvent`, role/name. Independent literals: `Баланс 110` (label), `Забота 50` / `Настроение 50` (labels on strip and visible full lines on Main), `Этап Новичок` (label), visible `Новичок`, ⚙ still `getByRole("button", { name: "Настройки" })`. Do not require visible text `Копилка 0` on Main; require the Копилка tile and a visible `0` (or the pot line) plus `В копилке 0` after opening Копилка.
- Cover: strip absent on Первый запуск / Стартовый бюджет; present on Main after Пособие; present on План with «Назад» still there; hidden while a tour tooltip is up; ⚙ from Main opens Настройки; after a Копилка deposit, Main’s tile shows the new pot and the strip still shows spendable Баланс (not the pot).
- Sister flows (`savingsFlow`, `adultFlow`, `demoFlow`, `dayClose*`) keep testing economy; update only queries that break because `Копилка N` / `Этап Новичок` moved from a Badge text node. Do not add a second chrome suite.

## Out of Scope

- Bottom tabs, a new navigation map, or putting Назад / Adult / Словарик into the strip.
- Making Этап dots or Баланс open Прогресс / Журнал.
- Changing pot math, Цель presets, or dropping the Main Цель card.
- TaskRun/TaskResult/Adult chrome.
- Animation toggle, new pictogram art beyond ⚙ / existing meter icons / simple circles.
- Rewriting «Как играть» beats, FeedbackCard, or FirstRun.

## Further Notes

- Grill locked 2026-09-20: play screens only; order Забота → Настроение → Баланс → Этап → Настройки; strip meters icon+bar with TalkBack value; Main keeps full bars; ⚙-only Настройки; Копилка pot on tile + Копилка page; Назад under the strip; hide strip during tour; dots then current name; Баланс icon+number; waiting tile keeps lock hint and pot; only Настройки is a button; TaskResult has no strip.
- R3 “savings visible on Main” is satisfied by the Копилка tile, not the strip.
- ROADMAP §2.2 already allows meters as icon + bar (never color alone); painted numbers stay on Main’s full bars.
