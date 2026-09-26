# Mascot-forward chrome kit

Status: ready-for-agent

## Problem Statement

Финни currently looks like a stack of flat cream rectangles. Buttons, chips, cards, nav tiles, and speech bubbles are copied inside screens instead of shared, so each surface has a slightly different shape and the app does not feel like one game. Kids comparing it to familiar learning apps see a settings-form hub rather than a mascot-forward home.

The primary action does not look pressable. Disabled «Дальше» only fades. Selection on the План tile is mostly a color change. Этап, Баланс, and Копилка sit as plain text. «Как играть» stacks controls in the scroll instead of keeping the next action in reach.

## Solution

Restyle every current child-facing screen with one shared chrome kit inspired by familiar raised-button learning apps, without copying another brand’s mascot, green, or progress mechanics.

The child still plays Финни: cream/orange, Russian sentence case, Питомец as narrator, 2×3 hub. What changes is the chrome: raised primary actions, round Cards, Chip pickers with a visible check, a top Badge strip, pictogram NavTiles, a tailed SpeechBubble, and a pinned bottom action on linear flows.

## User Stories

1. As a ребёнок opening any current screen, I want the same cream background, round cards, and chunky type, so that the app feels like one game.
2. As a ребёнок, I want primary actions to look raised with a darker bottom edge, so that I can tell what to tap.
3. As a ребёнок, I want a raised primary button to drop down when I press it, so that the tap feels immediate.
4. As a ребёнок, I want a disabled primary action to look flat and grey, so that I do not keep tapping «Дальше» before names are valid.
5. As a ребёнок, I want quiet actions such as «Пропустить» and «Закрыть» to be text, not a second raised brick, so that the main path stays obvious.
6. As a ребёнок, I want «Назад» to remain a readable word on a ≥48 dp target, so that I am not hunting for a tiny chevron.
7. As a ребёнок on Первый запуск, I want «Дальше» / «Играть!» pinned at the bottom, so that I can go on without scrolling past the pet.
8. As a ребёнок on «Как играть», I want the same pinned primary action, so that lesson-like steps share one rhythm.
9. As a ребёнок on Main, I want the hub to keep scrolling as one page, so that pet, meters, goal, task, and tiles stay visible together.
10. As a ребёнок on Main, I want a top strip of Badges for Этап, Баланс, and Копилка, each with icon + word + number, so that status is dense but still named in domain words.
11. As a ребёнок on Main, I want my Питомец large and centered under that strip, so that the creature is the home screen, not a corner decoration.
12. As a ребёнок, I want Settings to stay a labelled control, so that ⚙ is not an unlabeled icon.
13. As a ребёнок, I want Забота and Настроение as taller rounded bars with icon + number, so that meters stay readable without becoming lives/hearts.
14. As a ребёнок, I want Цель and Задание on Cards, so that those blocks match the rest of the chrome.
15. As a ребёнок, I want the 2×3 destinations as NavTiles with a pictogram plus the existing word, so that the hub feels like a game map instead of a settings grid.
16. As a TalkBack user, I want each NavTile’s accessible name to stay the word (План, Магазин, …), so that decoration is not announced twice.
17. As a ребёнок whose План is not confirmed, I want the План tile to show a check plus «Составь план дня», so that the next step is not color-only.
18. As a ребёнок on the Питомец phase of Первый запуск picking Вид, Окрас, or Аксессуар, I want bead sliders whose selected stop shows the accent bead in its circle, so that selection is obvious without a Chip check.
19. As a TalkBack user, I want selected Chips (everywhere Chip remains) to stay `aria-selected`, so that tests and TalkBack share the same state.
20. As a ребёнок on «Как играть», I want the pet centered above a SpeechBubble with a tail pointing up, so that the pet is clearly speaking.
21. As a ребёнок on «Как играть», I want the pet’s name visible next to that bubble, so that replay still feels personal.
22. As a TalkBack user, I want each bubble announced once as «Питомец [имя] говорит: …», so that the decorative pet is not read twice.
23. As a ребёнок using Словарик, I want terms and «Как играть» to sit in the same Card/button chrome, so that help does not look like a leftover screen.
24. As a ребёнок on Стартовый бюджет, stubs, and Settings, I want the same Screen/Card/PrimaryButton chrome, so that unfinished destinations still belong to the game.
25. As a ребёнок, I want body text at least 16 sp and headings in Russian sentence case, so that the 7–11 register holds.
26. As a ребёнок with system font enlargement, I want buttons, chips, badges, and the pinned bar to stay usable at 360 dp, so that large text does not clip the next action.
27. As a ребёнок, I want no owl, no borrowed green success-only palette, and no English all-caps headings, so that Финни keeps its own identity.
28. As a ребёнок, I want no streak, hearts, XP, leagues, or lesson path, so that progress stays Этап, Забота, Настроение, and the Игровой день.
29. As a returning ребёнок, I want launch to still skip Первый запуск and open the restyled Main, so that chrome work does not change routing.
30. As a ребёнок finishing Первый запуск, I want the same pet-first sequence and the same single profile commit, so that a visual pass cannot break setup.
31. As a разработчик, I want one kit instead of per-screen copies of chips, cards, tiles, and text actions, so that a later screen cannot invent a fourth button style.
32. As an accessibility reviewer, I want color never to be the only selected/disabled/highlight cue, so that the existing UX constraint still holds.

## Implementation Decisions

- Treat this as a chrome pass over existing screens. Do not change persistence, content schema, first-run commit, routing, economy, or copy meaning except new chrome labels (pictograms, «выбрано»/check, badge prefixes if needed).
- Expand the theme: title / section / body / button sizes; keep body ≥16; add tokens for raised-face, raised-edge, disabled-face, card radius, and badge fill. Stay inside the cream/orange identity. Do not add a Duo-green success token.
- Replace the single-purpose primary control with a raised PrimaryButton used everywhere «Играть!», «Дальше», «Понятно», «Закончить день», and similar primaries appear. Disabled: flat grey, no edge, no press translation, `aria-disabled`, still ≥48 dp.
- Add TextButton for quiet actions («Пропустить», «Закрыть», secondary «Назад» where it is not the chrome BackButton).
- Keep BackButton as the word «Назад» on a ≥48 dp target; restyle to the kit, not an icon-only control.
- Extract Chip, Card, Badge, NavTile, SpeechBubble, and a Screen layout (cream background, padding, optional pinned footer). FirstRun, HowToPlay, Main, Glossary, StartingBudget, Settings, and Stub must consume these instead of local copies.
- Chip selected state: visible check plus existing `aria-selected`. Fill/border may change but must not be the only cue.
- NavTile: pictogram + word; accessible name is the word. Placeholder pictograms (emoji or simple glyphs) are enough until designer art. Highlighted План tile includes a check plus the existing hint.
- Badge: icon + word + number for Этап, Баланс, Копилка on Main. Do not invent XP or lives.
- Main structure, top to bottom: Badge strip; large centered PetView; Settings control; MeterBars; optional Пособие ribbon; Цель Card; Задание Card; 2×3 NavTiles; raised «Закончить день». No bottom tab bar. No vertical lesson path.
- HowToPlay / rules phase: pet centered, name visible, SpeechBubble below with tail pointing up; primary + quiet action in the pinned footer. Keep existing replay labels and TalkBack bubble announcement. Decorative PetView stays hidden from the reading order on those steps.
- FirstRun appearance and names: same phases and validation; Питомец phase uses bead sliders for Вид, Окрас, and Аксессуар (accent bead in the selected circle; circle buttons keep today’s option names and `aria-selected`; not kit Chip); primary in the pinned footer on all three phases so «Дальше» is always reachable.
- MeterBar: taller rounded track/fill; keep icon + number; do not switch to discrete hearts.
- System font only. No bundled rounded webfont. No uppercase Latin headings.
- Press translation on PrimaryButton and raised NavTiles is the 1 s visual response, not an M6 animation-toggle feature. It must remain understandable if the OS reduces motion (edge can stay; bounce is forbidden).
- Strings for pictograms and checks live in the centralized strings module. Do not put English chrome in screens.
- ROADMAP §4 already records this chrome; do not add brand-homage terms to the domain glossary.

## Testing Decisions

- A good test asserts what the child can see and do: words, roles, enabled/disabled, selection checks, badge text, navigation, pinned actions present, first-run commit unchanged. It does not assert shadow height, exact hex, border radius, or snapshot the tree for styling.
- Use one navigation-root React Native Testing Library seam with the existing injected session ports (`FinPetApp` + fakes), the same seam as Первый запуск. Do not add a second visual-regression or per-component screenshot seam.
- Follow RNTL v14: async `render`, `screen`, `userEvent`, role/name queries.
- Extend the existing first-run flow coverage rather than a parallel suite: pet-first journey still completes once; selected appearance option buttons stay selected (`aria-selected` / `toBeSelected`) without requiring a Chip check glyph; names still disable then enable «Дальше»; «Как играть» still announces the bubble once; skip/finish still commit once; replay still uses «Готово» / «Закрыть» with no second commit.
- Cover Main for a returning child: Badge texts for Этап / Баланс / Копилка; NavTiles still named План, Магазин, Копилка, Задания, Прогресс, Взрослый раздел; highlighted План includes the plan hint; Settings still opens.
- Cover glossary and stub chrome only as far as existing flow already walks them (Прогресс → terms → «Как играть» → back). Do not snapshot glossary layout.
- Do not test press-translation math. Device acceptance is the place to confirm the raised edge, depress on press, pinned bar at 360 dp with large text, and that indicators/chips do not look like unlabeled icons.
- No new repository tests. Persistence is unchanged.

## Out of Scope

- Streak, hearts, XP, leagues, lesson path, bottom tabs, owl mascot, borrowed green brand palette.
- Bundled fonts, sound, confetti, or the M6 animation toggle.
- New gameplay screens (План, Магазин, Копилка, TaskRun, Adult, FeedbackCard) beyond giving stubs/settings the same chrome.
- Changing first-run order, validation rules, commit timing, grants, or meters’ meaning.
- Designer pet/tile art beyond placeholder pictograms.
- Visual regression / screenshot tests.
- Domain glossary entries for chrome or other apps’ product terms.

## Further Notes

- Current shared pieces are only the flat primary button, text BackButton, MeterBar, PetView, and the whole HowToPlay screen. Chip rows, cards, tiles, and quiet text actions are local — that is the reuse gap this spec closes.
- Питомец-phase Вид / Окрас / Аксессуар pickers are bead sliders (`.scratch/first-run-bead-sliders/spec.md`), not kit Chip. Chip’s visible check plus `aria-selected` still applies to every Chip that remains (Demo, Магазин, Копилка, Прогресс, План-needed NavTile, and similar).
- Pictograms are decoration. If a tile has both an emoji and a word, queries must keep using the word.
- Device follow-up (same Android SDK gap as earlier milestones): 360 dp portrait, enlarged text, raised buttons look pressable, pinned CTA visible on first run, airplane mode still irrelevant to chrome but hub must remain offline.

Superseded 2026-09-20 by `.scratch/play-status-strip/spec.md`: Main no longer uses a scrolling Этап/Баланс/Копилка Badge row, and Настройки is a ⚙ in the pinned play-screen strip (accessible name «Настройки») rather than a labelled mid-page word.
