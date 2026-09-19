# Compact speech cloud for Имя

Status: ready-for-agent

## Problem Statement

A ребёнок who just built a Питомец then sees a title «Имя», a pet, a full-width speech card, and a separate form field also named «Имя». That stack reads as naming yourself. The pet’s first-person line is easy to miss, especially when the keyboard opens on autofocus. The child should name the creature by finishing the pet’s own sentence in a cloud coming from a centered Питомец.

## Solution

Rebuild only the Имя layout. No visible phase title. A compact speech cloud sits above a centered Питомец, with a tail pointing down at the pet. The cloud is the sentence «Меня зовут» plus a name-tag chip: placeholder «____», a trailing ✏️ inside the chip, accessible name «Меня зовут». The child taps the chip to type; there is no autofocus. Long names scroll sideways in the chip. «Назад» and «Дальше» stay in the pinned footer. «Как играть» keeps today’s wide SpeechBubble.

Domain and persistence stay as they are: only the pet is named; 1–20 graphemes after trim; commit still writes that trimmed string to both leftover `name` and `petName`. This is still scripted Питомец speech, not Помощник.

## User Stories

1. As a ребёнок leaving Питомец, I want the next screen to be the pet I just made, not a title «Имя», so that I am not asked for “a name” in the abstract.
2. As a ребёнок, I want the Питомец in the center of the content area, so that the creature is the thing being named.
3. As a ребёнок, I want a compact speech cloud above the pet, so that the words come from that creature.
4. As a ребёнок, I want a tail from the cloud pointing down onto the pet, so that the cloud is attached to the speaker.
5. As a ребёнок, I want that cloud to hug its contents rather than stretch edge to edge, so that it looks like a cloud, not a form card.
6. As a ребёнок, I want the cloud to say «Меня зовут» in the pet’s voice, so that I am finishing the pet’s sentence.
7. As a ребёнок, I want the blank to be a name-tag chip inside the cloud, so that I can tell where to write.
8. As a ребёнок, I want that chip to use card fill and a track border, so that it looks like a place to type, not more bubble text.
9. As a ребёнок, I want the chip at least 48 dp tall, so that a small finger can hit it.
10. As a ребёнок who has not typed yet, I want placeholder «____» in the chip, so that it reads as a fill-in-the-blank.
11. As a ребёнок, I want a ✏️ at the trailing edge inside the chip, so that “write here” is obvious.
12. As a ребёнок, I want tapping the pen to do nothing extra, so that it is not a second control.
13. As a ребёнок, I want tapping the chip to open the keyboard, so that writing happens in the pet’s line.
14. As a ребёнок arriving on the phase, I do not want the keyboard already open, so that I see the pet and the cloud first.
15. As a ребёнок typing «Пух», I want the chip to show «Пух» and the «____» to go away, so that the name lands in the sentence.
16. As a ребёнок who deletes the name, I want «____» to return, so that the blank does not get stuck.
17. As a ребёнок who types only spaces, I want «____» to stay, so that whitespace is not a name.
18. As a ребёнок with a long name, I want the chip to scroll sideways, so that the cloud does not grow into a paragraph or hide what I typed behind an ellipsis.
19. As a ребёнок, I want no second text field under the pet, so that naming myself is not suggested.
20. As a ребёнок, I want no example name such as «Пух» as a placeholder, so that I am not nudged to copy it.
21. As a ребёнок, I want no «А тебя как зовут?», so that the app never asks for my name.
22. As a ребёнок, I want pinned «Дальше» as the confirm, so that the cloud does not grow a send button.
23. As a ребёнок, I want «Дальше» disabled until the name is valid, so that I cannot continue empty or oversized.
24. As a ребёнок, I want surrounding spaces stripped on check and save, so that accidental spaces are not kept.
25. As a ребёнок, I want 1–20 visible graphemes after trim, so that the name still fits later screens.
26. As a ребёнок, I want every character type accepted within that length, so that emoji names still work.
27. As a ребёнок who leaves an invalid chip, I want «Введи от 1 до 20 символов» under the pet cluster, not inside the cloud, so that the cloud stays a sentence.
28. As a ребёнок with a valid name, I want «Дальше» to open «Как играть», so that the named pet explains the game next.
29. As a ребёнок, I want «Назад» to return to Питомец with appearance and typed name kept, so that going back is safe.
30. As a ребёнок on «Как играть», I want «Назад» to return to this cloud with «Пух» still in the chip, so that I can fix the name.
31. As a ребёнок, I want Android Back to mirror visible «Назад», so that the hardware key stays predictable.
32. As a ребёнок, I want no profile written until «Как играть» is finished or skipped, so that quitting mid-name leaves nothing.
33. As a ребёнок who finishes or skips «Как играть», I want the trimmed pet name saved as `petName` and also in the leftover profile `name`, so that persistence stays filled without a migration.
34. As a ребёнок on «Как играть», I want that screen unchanged: wide SpeechBubble, visible pet name, «Питомец [имя] говорит: …», so that this pass does not restyle the rules.
35. As a TalkBack user, I want the chip named «Меня зовут», so that I hear the pet’s sentence, not a generic «Имя».
36. As a TalkBack user, I want the ✏️ hidden from the reading order, so that I do not hear “pencil.”
37. As a TalkBack user, I want the cloud not announced as «Питомец [имя] говорит: …» while the pet is still unnamed.
38. As a TalkBack user, I want the pet image to describe appearance without a name, so that the chip is the name announcement.
39. As a TalkBack user, I do not want a heading «Имя», so that I am not told to enter “a name” twice.
40. As a ребёнок with the keyboard open, I want «Дальше» still tappable, so that dismissing the keyboard is not required.
41. As a ребёнок at 360 dp with larger text, I want the cloud, chip, pet, and footer still reachable, so that the compact bubble does not block the phase.
42. As a ребёнок offline, I want naming to work with no network.
43. As a разработчик, I want this cloud used only on Имя, so that «Как играть» does not change look.
44. As a разработчик, I want no new chrome-kit primitive required, so that SpeechBubble stays the wide How-to-play card.
45. As a разработчик, I want FirstRun draft, validation, and complete-first-run dual-write left as they are, so that this is a layout pass, not a profile rewrite.
46. As a разработчик, I want ROADMAP’s Имя paragraph to describe a compact cloud above the pet with an in-cloud chip, so that living docs do not still show a title plus a field under a wide card.
47. As a разработчик, I want the previous pet-spoken Имя spec left as history, with a comment that its form layout was superseded, so that we do not rewrite a finished spec in place.
48. As an accessibility reviewer, I want tests to find one textbox named «Меня зовут», so that TalkBack and the suite share one contract.
49. As a разработчик, I want existing first-run flow coverage updated rather than a second suite, so that helpers no longer query a heading or textbox «Имя».

## Implementation Decisions

- Scope is the Имя phase layout plus the ROADMAP sentence that still describes title + wide bubble + field below. Do not change Питомец appearance sliders, «Как играть» cards, Стартовый бюджет, Main, Demo, schema, or complete-first-run’s port shape.
- Keep the FirstRun phase machine, in-memory draft with only `petName`, grapheme validation, blur message, footer «Назад» / «Дальше», dual-write of trimmed pet name on commit, and no autofocus.
- Remove the visible «Имя» title from this phase. Do not replace it with another heading.
- Center the speaker cluster in the content area above the footer: compact cloud, then pet. Cloud hugs its contents (not `alignSelf: stretch`). Tail points down at the pet. Reuse existing card fill / radius / text tokens. Do not restyle the kit SpeechBubble used by «Как играть». Do not add this compact cloud to the chrome-kit member list.
- Inside the cloud: static «Меня зовут», then one TextInput chip (card fill, track border, min 48 dp). Placeholder «____». Trailing ✏️ in the chip, `aria-hidden`, not `role="button"`, not part of the accessible name. Accessible name of the field is «Меня зовут». No `autoFocus`.
- Empty-or-whitespace field shows the placeholder; otherwise the chip shows the current value. The chip scrolls horizontally for long values; the cloud does not wrap the name onto extra lines and does not ellipsize while typing.
- One textbox only. No composer, no confirm inside the cloud, no child-side bubble.
- Validation copy stays under the cluster. Keep keyboard tap handling on the screen so the footer works with the keyboard open.
- Update ROADMAP FirstRun *Имя* to this layout. Append a comment on `.scratch/first-run-pet-name/spec.md` that the form layout (title «Имя», wide bubble, field below, autofocus, accessible name «Имя») is superseded here. Do not revert CONTEXT.md.

## Testing Decisions

- A good test asserts what the child and TalkBack can observe: no heading «Имя», one textbox named «Меня зовут», placeholder then typed value, single field, enabled/disabled «Дальше», validation, Back retention, unchanged «Как играть» `petSays` announcement, and the same dual-write commit. It does not assert tail coordinates, emoji code points as accessible names, scroll offsets, or `autoFocus` props.
- Use one seam: the existing navigation-root React Native Testing Library first-run flow suite with injected session ports. Do not add a cloud component suite. Horizontal scroll, tail geometry, and keyboard vs centered pet at 360 dp are device acceptance.
- Follow RNTL v14: async `render`, `screen`, `userEvent`, role/accessible-name queries. Prior art is the current first-run helper that types into the naming textbox.
- Replace queries for heading/textbox «Имя» with textbox «Меня зовут». Assert `queryByText("Имя")` is not on the naming phase (heading gone). Helper that reaches «Как играть» types «Пух» into «Меня зовут».
- Cover: empty chip shows placeholder «____»; typing «Пух» shows that value in the chip; still one textbox; no field under the pet besides the chip; no autofocus assertion required (and do not assert the field is focused on entry).
- Keep blur, grapheme, trim dual-write, Back, remount, skip, and failed-complete cases, pointed at the one pet-name field.
- Cover «Как играть» still using «Питомец Пух говорит: …» and showing the visible pet name. Naming-phase bubble must not use that helper.
- Do not assert the ✏️ as an accessible name. Do not add a second test file.

## Out of Scope

- Collecting a name for the ребёнок.
- Schema migration or dropping the leftover profile `name` column.
- Restyling «Как играть», making the compact cloud a kit primitive, or unifying both bubbles.
- Autofocus, a title «Имя», a field under the pet, or a confirm inside the cloud.
- Помощник, chat history, animation, sound, talking poses.
- Editing the pet name after the Профиль ребёнка exists.
- Rewriting the historical pet-spoken Имя spec except a supersession comment.

## Further Notes

- Grill locked: type in the cloud (chip + ✏️) only because the chip is a visible 48 dp write-in; no title; compact cloud above centered pet, tail down; no autofocus; footer «Дальше»; placeholder «____»; horizontal scroll; pen inside the chip and silent to TalkBack; field name «Меня зовут».
- Domain locked earlier: pet name only; leftover `name` duplicates `petName`; glossary already defines Профиль ребёнка as the pet.
- The first-run-pet-name spec’s stories about title «Имя», a field under the bubble, autofocus, and accessible name «Имя» are superseded here. Appearance, «Как играть», validation limits, and commit timing remain in force.

## Comments

**2026-09-19 — Как играть superseded.** Wide SpeechBubble «Как играть» and commit-after-rules are superseded by `.scratch/how-to-play-tour/spec.md`. The compact Имя cloud still stands.
