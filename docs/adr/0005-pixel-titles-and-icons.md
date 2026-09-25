# Pixel titles and outline icons on the soft chrome

## Status

accepted

## Context & decision

The Питомец is already pixel art, and the chrome should feel more like that without becoming a Minecraft inventory. Screen titles use Press Start 2P: 24 sp when the line is short, 16 sp when it is longer, including Выбери цель and Итоги дня. Карта заданий stays the phone font because that line is too wide. The Баланс number uses the pixel face at 16 sp, centered with the coins icon. Body text stays the phone font. Pictograms and the leading mark on every button are outline icons from the free pixelarticons set, hidden from TalkBack. Положить and Забрать use a down arrow and an up arrow. The bottom bar is a raised tray: the selected tab is a token with the same gold face and 4 px lip as a button. Where that set has no matching picture, the emoji stays. Corners stay the smooth radii already in the theme: a stair-step clip fights the raised 4 px button lip.

## Considered options

- **Pixel type everywhere**: rejected — Press Start 2P is too wide for Russian sentences, and kids 7–11 need a normal face for body text.
- **A smooth icon set until a designer draws pixels**: rejected — pixelarticons already covers the pictures we can swap, and a smooth set would be a second look to throw away.
- **Stair-step corners**: rejected — cards would be easy, but buttons and tiles are two layers that slide on press, and React Native has no clip that keeps that lip aligned.

## Consequences

- Verdicts keep their words («Верно», «Есть цена», «Попробуй ещё»). The check and the warning are icons; «Есть цена» keeps 🤔 because there is no thinking-face icon. Difficulty is three stars, unused ones dimmed, and TalkBack hears «Сложность: N из 3».
- The drumstick, pig, bow, chick, and the bank stay emoji. Настроение uses the smile. «Обязательные 0» uses the square exclamation, and «Обязательные +2» uses the check. Баланс uses the coins icon, Окрас the color swatch, the book the open book.
- The adult section uses the same buttons and icons. Its title is pixel at 16 sp.
