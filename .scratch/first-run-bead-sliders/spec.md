# Bead sliders for Первый запуск appearance

Status: ready-for-agent

## Problem Statement

On the Питомец phase of Первый запуск, a ребёнок 7–11 customizes Вид, Окрас, and Аксессуар with Chip rows of placeholder names («Вид 1», «Окрас 2», …). That looks like a form, not a toy: the stops are labeled like settings, selection uses a check, and there is nothing to slide. The live preview is the fun part, but the controls fighting it are still buttons.

## Solution

Replace those three Chip rows with three discrete bead sliders, one each for Вид, Окрас, and Аксессуар, on the Питомец phase only.

Each slider is a row of large identical circles joined by a line. Every circle holds a small dim bead. The selected value is an accent bead: while the finger is down it travels along the line; on release it snaps into the nearest large circle. Tapping a circle also selects that stop. A legend plus an emoji sits above each track. Option names stay off the screen; the Питомец preview is how the child sees what they picked. TalkBack still hears the old option names on each circle.

The rest of Первый запуск — title, preview, «Дальше», Имена, Как играть, commit — stays the same. Appearance still cannot be edited after the profile is created.

## User Stories

1. As a ребёнок on the Питомец phase, I want to pick Вид, Окрас, and Аксессуар with bead sliders instead of Chip rows, so that customizing the pet feels like play.
2. As a ребёнок, I want a complete default Питомец (first Вид, first Окрас, first Аксессуар) already selected, so that I can tap «Дальше» without touching a slider.
3. As a ребёнок, I want three separate sliders, so that each appearance axis is its own toy.
4. As a ребёнок, I want each slider to have exactly three stops, so that all 27 combinations remain available.
5. As a ребёнок, I want the three sliders to be independent, so that changing Вид does not reset Окрас or Аксессуар.
6. As a ребёнок, I want large circles joined by a line, so that I can see the stops and the path between them.
7. As a ребёнок, I want every large circle to contain a small bead, so that empty rings do not look broken.
8. As a ребёнок, I want unselected beads dim and the selected bead in the accent color, so that I can tell which stop is on.
9. As a ребёнок, I want all three sliders to use the same accent and dim pair, so that Окрас does not turn into a color palette.
10. As a ребёнок, I want the large circles themselves to look the same whether selected or not, so that the bead is the thing that moves, not the ring.
11. As a ребёнок, I want the connecting line to run through the circle centers with the circles painted on top, so that the track reads as one piece.
12. As a ребёнок, I want the accent bead to sit inside the selected circle when my finger is up, so that the chosen stop is obvious at rest.
13. As a ребёнок dragging, I want the accent bead to travel along the line with my finger, so that the control feels like a slider.
14. As a ребёнок dragging, I want the three dim beads to stay in their circles, so that the track never looks empty.
15. As a ребёнок who lets go, I want the accent bead to jump to the nearest large circle with no animation, so that the value always lands on a real option.
16. As a ребёнок, I want a tap on a large circle to select that stop immediately, so that I do not have to drag if I already know which one I want.
17. As a ребёнок, I want to start a drag from the line, a dim bead, or the accent bead, so that I do not have to grab a tiny thumb.
18. As a ребёнок whose finger slides off the slider, I want the gesture to keep tracking left–right and still snap on release, so that a messy drag does not cancel my choice.
19. As a ребёнок, I want a press that does not move to count as a tap on that stop, so that a careful tap is not treated as a failed drag.
20. As a ребёнок, I want the Питомец preview to change as soon as the nearest stop changes, including during a drag, so that I see the pet follow the bead.
21. As a ребёнок, I want no on-screen «Вид 1» / «Окрас 2» / «Аксессуар 3» labels on the stops, so that placeholder names do not clutter a kid screen.
22. As a ребёнок, I want a legend and an emoji above each slider (🐣 Вид, 🎨 Окрас, 🎀 Аксессуар), so that I know what that track changes.
23. As a ребёнок, I want those legends to keep the domain words Вид, Окрас, and Аксессуар, so that the screen matches the rest of the game language.
24. As a ребёнок, I want the Вид emoji not to be 🐾, so that it is not confused with Забота.
25. As a ребёнок, I want the phase still titled «Питомец», so that I know where I am in Первый запуск.
26. As a ребёнок, I want the live preview to stay above the sliders, so that the pet remains the focus.
27. As a ребёнок, I want «Дальше» still pinned in the footer, so that I can leave the phase without scrolling past the pet.
28. As a ребёнок, I want Имена and Как играть unchanged, so that this pass does not redo the whole journey.
29. As a ребёнок who likes the defaults, I want to continue without moving a slider, so that customization is never required.
30. As a ребёнок who goes to Имена and back, I want my slider choices kept, so that Back does not throw the pet away.
31. As a ребёнок who force-quits before finishing Первый запуск, I want the next launch to start from the default pet again, so that no hidden draft remains.
32. As a ребёнок who finishes Первый запуск, I want the chosen Вид, Окрас, and Аксессуар written on the Профиль ребёнка exactly as today, so that later screens still show the pet I made.
33. As a returning ребёнок, I want no appearance sliders after the profile exists, so that I am not asked to rebuild the pet every day.
34. As a TalkBack user, I want each large circle to be a button named «Вид 1», «Окрас 2», or «Аксессуар 3» as today, so that I can pick an option by name.
35. As a TalkBack user, I want the snapped (or, while dragging, nearest) stop to be `aria-selected`, so that selection is announced without a visible check.
36. As a TalkBack user, I want unselected circles to stay enabled, so that dim never means I cannot choose them.
37. As a TalkBack user, I want the emoji, the connecting line, and the traveling bead hidden from the reading order, so that decoration is not announced.
38. As a TalkBack user, I want the legend words Вид, Окрас, and Аксессуар still visible in the reading order, so that I know which group I am in.
39. As a TalkBack user, I want the Питомец preview to keep its existing image name (including Вид / Окрас / Аксессуар words), so that the pet description does not change.
40. As a TalkBack user, I want circle accessible names not to include the emoji, so that I do not hear «chicken Вид 1».
41. As a ребёнок with small fingers, I want each large circle to meet the 48 dp minimum target, so that stops are easy to hit.
42. As a ребёнок at 360 dp portrait, I want all three sliders usable without clipping «Дальше», so that the toy fits the phone.
43. As a ребёнок, I want a little extra space around the three tracks, so that the sliders do not feel jammed under the pet.
44. As a ребёнок, I want no check mark on the selected stop, so that the accent bead is the selected cue (its circle is a different position, not color alone).
45. As a ребёнок, I want no sliding animation after release, so that snap is instant.
46. As a разработчик, I want one reusable bead-slider control used three times on this phase, so that the three rows cannot drift apart.
47. As a разработчик, I want that control not to join the chrome kit, so that Chip remains the kit picker everywhere else.
48. As a разработчик, I want appearance keys, draft fields, PetView, and first-run commit untouched, so that this is a picker swap, not a profile rewrite.
49. As a разработчик, I want ROADMAP, the pet-first Первый запуск spec, and chrome-kit FirstRun notes to describe bead sliders instead of Chip rows for this phase, so that docs do not keep requiring checks on appearance Chips.
50. As a разработчик, I want Chip to remain on Demo, Магазин, Копилка, and Прогресс, so that this change does not rip the kit out of other screens.
51. As an accessibility reviewer, I want tests to keep finding appearance options by button name and selected state, so that TalkBack and the suite share one contract.
52. As a ребёнок, I want changing only Окрас or only Аксессуар to update the preview the same way Вид does, so that every slider is first-class.

## Implementation Decisions

- Scope is the Питомец phase appearance pickers only. Do not restyle the phase title, PetView, footer, Имена, or Как играть. Do not add a later appearance editor.
- Add one reusable discrete bead-slider control under the shared UI components. The Питомец phase renders three instances (Вид, Окрас, Аксессуар). Do not inline three copies. Do not add the control to the chrome-kit member list and do not write an ADR.
- Keep the existing appearance key sets, default first-of-each, in-memory FirstRun draft, live PetView wiring, and `firstRun.complete` payload. The slider writes the same key the Chip used to write.
- Remove Chip from the appearance groups. Leave Chip in place on every other screen that already uses it.
- Visual recipe: identical large circles (card fill, track-colored ring) on a track-colored line through their centers, circles painted over the line. Each circle contains a small bead. Unselected beads use the disabled-face token; the selected / traveling bead uses the accent token. Do not add a `primary` token. Do not tint Окрас beads with the pet’s actual colors.
- At rest, the accent bead lives inside the selected circle; the other two circles keep dim beads. While dragging, all three stop beads stay dim and a separate accent bead follows the finger on the line. On release, that bead snaps into the nearest circle (exact midpoint → the left / lower-index stop). No animation.
- Gestures: the whole track (line + all circles) is the drag surface. A press that does not exceed a small movement threshold is a tap on that stop. Horizontal position keeps updating if the finger leaves the control; release always snaps; there is no cancel-on-leave.
- While dragging, both the draft value and the PetView follow the nearest stop, matching snap. `aria-selected` follows that same nearest stop.
- Label row above each track, left-aligned: emoji then the existing legend word. Emojis are 🐣 Вид, 🎨 Окрас, 🎀 Аксессуар. Pictograms are `aria-hidden`, same pattern as meters and AmountStepper. Do not reuse 🐾 for Вид.
- Stops have no visible option names. Keep the existing «Вид N» / «Окрас N» / «Аксессуар N» strings as accessible names on the circle buttons.
- Each large circle is `role="button"` with `aria-selected` on the current stop. Circles are never `aria-disabled` merely because they are unselected. The line, traveling bead, and emoji are excluded from the reading order. PetView keeps its current image accessible name on this phase.
- Large circles meet the existing 48 dp minimum target. Add modest extra gap around the three tracks; do not invent a new type scale.
- Centralize any new pictogram strings with the other chrome pictograms. Do not put English chrome on the screen.
- This spec supersedes Chip-row appearance pickers in the pet-first Первый запуск spec, chrome-kit FirstRun appearance bullets (including “selected Chip shows a check” for Вид / Окрас / Аксессуар), and the ROADMAP FirstRun appearance sentence. Update those documents in the same change. Chip’s check+`aria-selected` contract stays for every Chip that remains.
- Domain glossary already records Окрас and Аксессуар and defines appearance as Вид + Окрас + Аксессуар. Do not add slider, bead, or chrome words to the glossary.
- No schema migration, no new persistence, no new appearance keys or artwork.

## Testing Decisions

- A good test asserts what the child and TalkBack can observe: phase still «Питомец», legends present, option buttons named as today, `aria-selected` on the current stop, live preview text, draft kept on Back, defaults on remount, and the chosen appearance still reaching later screens. It does not assert component names, pan internals, bead coordinates, hex colors, or snapshot the tree for styling.
- Use one seam: the existing navigation-root React Native Testing Library first-run flow suite with injected session ports. Do not add a component-level slider suite or a gesture-driver seam. Drag, snap, traveling bead, and circle geometry are device acceptance.
- Follow RNTL v14: async `render`, `screen`, `userEvent`, role/name queries.
- Prior art is the current first-run flow helper that finds appearance options by `role="button"` and `toBeSelected()`. Keep querying «Вид 1» / «Вид 2» (and the Окрас / Аксессуар names) that way. Stop requiring a hidden check glyph on the selected appearance control — that cue belongs to Chip, which this picker no longer is.
- Extend the existing pet-customization case rather than a parallel suite: default preview and «Вид 1» selected; tap «Вид 2» updates preview and selected state; «Вид 1» is not selected. Add the same tap+preview+selected coverage for one Окрас change and one Аксессуар change so those sliders are not untested siblings.
- Keep the happy-path, Back-retention, and abandoned-draft cases: they still press «Вид 2» and later assert that selection (or the hub pet label) without going back to Chip checks.
- Assert the three legends «Вид», «Окрас», and «Аксессуар» are on the Питомец phase. Do not require the emoji to appear in any accessible name.
- Assert unselected option buttons are not disabled.
- Do not assert that the traveling bead or the connecting line exist as accessible elements.
- Device acceptance: at 360 dp portrait, three tracks with ≥48 dp circles, traveling bead on drag, snap on release with no animation, messy vertical leave still snaps, and «Дальше» still reachable. Confirm dim beads never look like a disabled control to a sighted child.

## Out of Scope

- Changing Имена, Как играть, Стартовый бюджет, Main, or any post–first-run screen.
- Editing appearance after the Профиль ребёнка exists (including Adult «Сбросить прогресс», which already keeps appearance).
- New Вид / Окрас / Аксессуар keys, artwork, or more than three stops.
- Visible per-stop labels, checks, or Окрас beads tinted with the pet colors.
- Animation, haptics, sound.
- Making the bead slider a chrome-kit primitive, or replacing Chip on Demo / Магазин / Копилка / Прогресс.
- A `role="slider"` / `adjustable` TalkBack model.
- Adding `primary` / `dim` theme tokens.
- Persistence, content schema, or glossary edits beyond what is already done.
- A general kid-visual rewrite of Первый запуск.

## Further Notes

- Grill locked: tap or drag; traveling accent bead plus standing dim beads; snap on release; no cancel-on-leave; preview follows nearest during drag; same accent/dim on all three tracks; emoji+legend above; TalkBack buttons with today’s option names; PetView img label unchanged; component lives with other UI primitives but is not a kit member; docs that still say Chip rows for this phase are wrong after this lands.
- Chrome-kit story “selected appearance Chip shows a check” is intentionally overridden here: the extra non-color cue is which circle holds the accent bead.
- Option names «Вид 1» etc. remain a11y-only placeholders until real creature/color/accessory names exist; this spec does not invent those names.
- CONTEXT.md already uses Окрас and Аксессуар as glossary terms; do not revert that as part of “docs updates.”
