# Child-facing chrome kit

Status: ready-for-agent

## Problem Statement

The app currently looks like a stack of flat cream rectangles. Buttons, cards, chips, hub tiles, and speech bubbles are copied inside screens instead of shared, so each new screen invents its own look. Primary actions all share one flat `AppButton`. Selected chips and the highlighted План tile change color only. Main puts the pet in a top row with plain text for Этап, Баланс, and Копилка, so the Питомец does not feel like the center of the product.

Kids 7–11 who have used other learning games expect chunky raised buttons, big rounded cards, and a mascot that talks. The current chrome does not give that feel, and it will not stay consistent as План, Магазин, and Копилка screens arrive.

## Solution

Restyle every current child-facing screen with one FinPet chrome kit inspired by friendly raised-button learning apps, without copying another product’s mascot, green, or progress mechanics.

The kit is: Screen, Card, PrimaryButton, TextButton, Chip, SpeechBubble, Badge, NavTile, plus the existing PetView, MeterBar, and BackButton. Linear flows pin the primary action at the bottom. Main stays one scrolling hub: badge strip, large centered pet, chunky meters, goal and task Cards, 2×3 pictogram tiles. Selection always includes a visible check, not color alone.

## User Stories

1. As a ребёнок, I want raised primary buttons that press down, so that taps feel physical.
2. As a ребёнок, I want a disabled primary button to look flat and grey, so that I do not try to tap «Дальше» before names are valid.
3. As a ребёнок, I want quiet actions like «Пропустить» and «Закрыть» to look lighter than the primary, so that the next step stays obvious.
4. As a ребёнок, I want «Назад» to stay a readable word at least 48 dp tall, so that I can leave a step without guessing at an icon.
5. As a ребёнок on Первый запуск, I want «Дальше» / «Играть!» pinned to the bottom, so that I can always reach the next step while the pet stays visible above.
6. As a ребёнок on «Как играть», I want the same pinned bar, so that the explanation feels like the same kind of step as setup.
7. As a ребёнок on Main, I want the screen to keep scrolling as one hub, so that pet, money, goal, and tiles stay in one place.
8. As a ребёнок, I want white rounded Cards for Цель and Задание, so that those blocks look like things I can read, not leftover text.
9. As a ребёнок choosing Вид, Окрас, or Аксессуар, I want the selected Chip to show a check as well as a highlight, so that I know what is selected without relying on color.
10. As a TalkBack user, I want selected Chips to stay `aria-selected`, so that selection is announced.
11. As a ребёнок, I want the План tile to show a check plus «Составь план дня» when a plan is still needed, so that the next action is not color-only.
12. As a ребёнок, I want a SpeechBubble under the pet with a small tail pointing up, so that the pet is clearly the speaker.
13. As a ребёнок, I want the pet’s name visible on «Как играть», so that the speaker is mine.
14. As a TalkBack user, I want each bubble announced once as «Питомец [имя] говорит: …», so that I do not hear the pet image twice.
15. As a ребёнок on Main, I want a top strip of Badges for Этап, Баланс, and Копилка, each with icon + word + number, so that status is dense but still named in FinPet words.
16. As a ребёнок on Main, I want the Питомец large and centered under the badges, so that the creature is the star of the hub.
17. As a ребёнок, I want Забота and Настроение as taller rounded bars with icon + number, so that meters stay readable and never become “lives”.
18. As a ребёнок, I want each hub destination to be a NavTile with a simple pictogram plus the Russian word, so that the grid feels like skills, not a settings list.
19. As a TalkBack user, I want NavTile accessible names to stay the words (План, Магазин, …), so that decoration is not announced as a second name.
20. As a ребёнок, I want Стартовый бюджет, Словарик, Settings, and stub screens to use the same Screen, Card, and buttons, so that no leftover screen looks like a different app.
21. As a ребёнок, I want body text at least 16 sp and sentence-case Russian, so that nothing shouts in English all-caps.
22. As a ребёнок with a large system font, I want the kit to still fit at 360 dp, so that first run and the hub do not overflow into dead ends.
23. As a ребёнок, I want touch targets at least 48 dp, including the pressed primary and «Назад».
24. As a ребёнок, I want the cream and orange FinPet colors to stay, so that the app does not look like a green language course.
25. As a ребёнок, I want no streak flame, hearts-as-lives, XP, leagues, owl, or lesson path, so that money-and-pet rules are not replaced.
26. As a разработчик, I want one kit instead of copied screen styles, so that later План / Магазин / Копилка screens reuse chrome instead of inventing it.
27. As a разработчик, I want PrimaryButton to replace the current single-style app button everywhere it is a primary action, so that there are not two primaries.
28. As a разработчик, I want HowToPlay’s quiet actions to use TextButton, so that first run and replay share chrome.
29. As a разработчик, I want FirstRun chips to use Chip, so that pickers are not a private copy.
30. As a разработчик, I want Main’s local tile and card styles removed in favor of NavTile and Card.
31. As a returning ребёнок, I want behavior unchanged: same first-run commit rules, same hub numbers, same replay safety.
32. As an accessibility reviewer, I want status never communicated by color alone, including disabled, selected, and plan-needed.
33. As a ребёнок tapping a raised button, I want a visual response within 1 s, so that the depress is the response, not a skippable extra animation.
34. As a ребёнок with animations disabled later, I want the depress-on-press to remain, so that this chrome is not gated on the M6 animation toggle.
35. As a хакатон judge, I want Appendix A 1–4 to still be playable, just better looking.

## Implementation Decisions

- Build one shared chrome kit and migrate every current child-facing surface onto it: Первый запуск, Стартовый бюджет, Main, Словарик, «Как играть» replay, Settings, stubs.
- Kit members: Screen (cream background, padding, safe layout), Card, PrimaryButton, TextButton, Chip, SpeechBubble, Badge, NavTile. Keep PetView, MeterBar, and BackButton; restyle MeterBar and BackButton to match the kit rather than duplicating them.
- PrimaryButton: orange fill, darker bottom edge, rounded; on press the face translates down and the edge collapses. Minimum height 48 dp. Disabled: flat grey, no edge, no translation, `aria-disabled`.
- TextButton: text-styled, 48 dp min height, used for «Пропустить», «Закрыть», and other quiet actions. Back stays the word «Назад» via BackButton or TextButton, never icon-only, never X.
- Chip: label plus a visible check when selected; `aria-selected`; highlight color is extra, not the only cue.
- SpeechBubble: body text in a rounded card; small tail pointing up at the pet; used by HowToPlay. Pet centered above the bubble; name visible. Replay and first-run rules share this layout.
- Badge: icon + word + number for Этап, Баланс, Копилка on Main. Do not invent gem/heart/XP labels.
- NavTile: pictogram + word, raised like a skill tile, 2×3 grid preserved. Accessible name is the word. План-needed state: check + existing hint text.
- Expand the theme type scale to title / section / body / button. Body and button ≥16. System font only. Russian sentence case. Keep FinPet cream/orange tokens; add only what raised/disabled/track states need. No Duo green, no new brand font.
- Linear flows (Первый запуск phases and HowToPlay) pin primary + quiet action in a bottom bar. Main, Glossary, Settings, stubs, StartingBudget keep actions in the scrolling content unless they are already short modal-like screens with one CTA.
- Replace the current single-style app button with PrimaryButton for primary actions («Дальше», «Играть!», «Понятно», «Закончить день», glossary «Как играть», stub backs that are primary). Do not leave a parallel flat primary.
- Pictograms may be simple emoji placeholders, like current pet art placeholders; they must not become the accessible name.
- No navigation map change: still FirstRun → StartingBudget → Main; still 2×3 hub; no bottom tabs; no lesson path.
- No domain, schema, economy, or first-run commit changes.
- Update centralized Russian chrome only where new visible words are required (for example «выбрано» is not required if a check is visible and `aria-selected` is set). Do not add English all-caps labels.
- ROADMAP §4 already records this chrome; do not add product-brand names to the domain glossary.

## Testing Decisions

- A good test asserts what a child can see and do: phase order, labels, enabled/disabled, selection announcements, hub numbers, navigation. It does not assert shadow pixels, translateY, border-radius, or theme token names.
- Use one navigation-root React Native Testing Library seam with injected session ports (the existing first-run flow test). That is the highest existing seam and already covers first run, hub, glossary, replay, settings, and stubs. Do not add a per-component visual snapshot suite.
- Follow RNTL v14: async `render` + `screen`, `getByRole` / accessible name, `userEvent`. Query visible RU text. `testID` last.
- Extend the existing flow so it still passes after chrome migration, and add assertions that match new child-visible behavior: selected Chip is selected; План needed exposes a check or equivalent accessible selected/hint; Main shows Этап / Баланс / Копилка as named badges; HowToPlay still announces one bubble; disabled names «Дальше» remains disabled; skip/finish/replay still commit exactly once.
- Do not test press-translation internals. Device acceptance is the place to confirm the raised edge, depress, pinned bar, bubble tail, and 360 dp + large text.
- Prior art: `src/ui/__tests__/firstRunFlow.test.tsx`. Replace or extend that file; do not create a parallel “chrome” suite that resteps Appendix A.

## Out of Scope

- Streak, hearts-as-lives, XP, leagues, owl mascot, lesson path, bottom tabs.
- Bundled brand fonts or a green palette.
- New screens (План, Магазин, Копилка, FeedbackCard, AdultGate).
- Changes to first-run persistence, grants, meters math, or content JSON meaning.
- Animation toggle, sound, or M6 accessibility audit beyond this kit’s 48 dp / 16 sp / not-color-only rules.
- Real designer pictograms (emoji placeholders are enough).
- Screenshot or style-snapshot tests.

## Further Notes

- Current shared UI is only a flat primary button, text Back, MeterBar, PetView, and a full HowToPlay screen. Chip, card, tile, bubble, and text-action styles are inlined and must move into the kit.
- This is a visual consistency pass on top of the pet-first Первый запуск already shipped.
- Device follow-up: 360 dp portrait, enlarged text, raised-button press, pinned first-run CTA, airplane mode still plays Appendix A 1–4.
