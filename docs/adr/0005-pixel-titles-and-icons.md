# Pixel titles and outline icons on the soft chrome

## Status

accepted

## Context & decision

The Питомец is already pixel art, and the chrome should feel more like that without becoming a Minecraft inventory. Short one-line screen titles (План, Магазин, Копилка, Задания, Итоги, Питомец, Банк, Словарик, ФинПет) use Press Start 2P at 24 sp. Every other heading, button, number, and body line stays the phone font. Pictograms are outline icons from the free pixelarticons set, hidden from TalkBack, at 48 dp on nav tiles and 24 dp beside a word. Where that set has no matching picture, the emoji stays. Corners stay the smooth radii already in the theme: a stair-step clip fights the raised 4 px button lip.

## Considered options

- **Pixel type everywhere**: rejected — Press Start 2P is too wide for Russian sentences, and kids 7–11 need a normal face for body text.
- **A smooth icon set until a designer draws pixels**: rejected — pixelarticons already covers the pictures we can swap, and a smooth set would be a second look to throw away.
- **Stair-step corners**: rejected — cards would be easy, but buttons and tiles are two layers that slide on press, and React Native has no clip that keeps that lip aligned.

## Consequences

- Verdicts keep their words («Верно», «Есть цена», «Попробуй ещё»). The check and the warning are icons; «Есть цена» keeps 🤔 because there is no thinking-face icon. Difficulty is three stars, unused ones dimmed, and TalkBack hears «Сложность: N из 3».
- Paw, pig, bow, chick, and the bank stay emoji. Баланс uses the coins icon, Окрас the color swatch, the book the open book.
- The adult section uses the same buttons and icons. Its title stays the phone font because it does not fit one pixel line.
