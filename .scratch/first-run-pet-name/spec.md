# Pet-spoken Имя in Первый запуск

Status: ready-for-agent

## Problem Statement

A ребёнок who just made a Питомец then lands on a form titled «Имена» with two labeled fields: a game name for themselves and a name for the pet. That feels like registration, asks for a person-name the rest of the game never shows, and does not let the pet speak. The child wanted the pet to introduce itself — «Меня зовут ____» — and to name only the creature, not themselves.

## Solution

Replace the Имена form with a single phase titled «Имя». The customized Питомец stays on screen and speaks one scripted SpeechBubble: «Меня зовут ____», which live-echoes the typed name. One unlabeled field (accessible name «Имя») sits under the bubble and is focused when the phase opens. «Дальше» in the pinned footer is the confirm; it stays disabled until the pet name is valid, then opens «Как играть».

The Профиль ребёнка is the pet (name + appearance). Первый запуск no longer asks for a child’s game name. On commit, the same pet name is written to both persistence name fields so the unused column stays filled without a schema migration. This is still scripted Питомец speech, not Помощник.

## User Stories

1. As a ребёнок leaving the Питомец phase, I want the next screen titled «Имя», so that I know I am naming the pet, not filling a two-name form.
2. As a ребёнок on «Имя», I want the Питомец I just customized still visible, so that I am naming that creature.
3. As a ребёнок, I want the pet to speak from a SpeechBubble, so that naming feels like meeting the pet rather than filling a form.
4. As a ребёнок, I want that bubble to say «Меня зовут ____» when the field is empty, so that the pet is asking to be named.
5. As a ребёнок typing, I want the bubble to live-echo «Меня зовут Пух» (or whatever I typed), so that I see the name land in the pet’s line.
6. As a ребёнок who deletes the name back to empty, I want the blank «____» to return, so that the prompt does not get stuck on a half-erased sentence.
7. As a ребёнок whose field is only spaces, I want the bubble to keep the blank, so that whitespace does not look like a name.
8. As a ребёнок, I want one text field under the bubble, so that there is a clear place to type.
9. As a ребёнок, I want no extra legend such as «Как зовут питомца?» or «Как тебя как зовут в игре?», so that the pet’s line is the only prompt.
10. As a ребёнок, I want no example placeholder such as «Пух» in the field, so that I am not nudged to copy a sample name.
11. As a ребёнок arriving on «Имя», I want the field already focused and the keyboard open, so that I can type immediately.
12. As a TalkBack user, I want the field named «Имя», so that the control matches the phase title.
13. As a ребёнок, I want a pinned «Дальше» as the confirm, so that this phase uses the same primary action as the rest of Первый запуск.
14. As a ребёнок, I want «Дальше» disabled until the name is valid, so that I cannot continue with an empty or oversized name.
15. As a ребёнок, I want surrounding spaces stripped when the name is checked and saved, so that accidental spaces are not kept.
16. As a ребёнок, I want 1–20 visible characters after trim, so that the name still fits later screens.
17. As a ребёнок, I want every kind of character accepted within that length, so that emoji and unusual names are not rejected.
18. As a ребёнок who leaves an invalid field, I want «Введи от 1 до 20 символов», so that I know how to continue.
19. As a ребёнок with a valid name, I want «Дальше» to open «Как играть», so that the named pet can explain the game next.
20. As a ребёнок, I want no second bubble such as «А тебя как зовут?», so that the app never asks for my own name.
21. As a ребёнок, I want no child game-name field at all, so that Первый запуск does not collect a person-name.
22. As a ребёнок, I want «Назад» to return to «Питомец» with my appearance and typed pet name kept, so that going back is safe.
23. As a ребёнок on «Как играть», I want «Назад» to return to «Имя» with the pet name still in the field and echoed in the bubble, so that I can fix the name.
24. As a ребёнок, I want Android Back to mirror visible «Назад» on this phase, so that the hardware key is predictable.
25. As a ребёнок at «Питомец», I still want Android Back to be allowed to leave the app, so that the journey does not trap me.
26. As a ребёнок, I want no Профиль ребёнка written until «Как играть» is finished or skipped, so that quitting mid-name leaves no profile.
27. As a ребёнок who finishes or skips «Как играть», I want the pet name saved as the pet’s name, so that later screens address that pet.
28. As a ребёнок who finishes or skips «Как играть», I want that same pet name also stored in the leftover profile name field, so that nothing in persistence is left blank.
29. As a ребёнок on «Как играть», I want to see the pet name as today (visible name plus rule bubbles), so that the rules still come from my named pet.
30. As a ребёнок on Main, I want the hub still to show the pet by that name, so that dropping the child game name does not blank the pet.
31. As a ребёнок replaying «Как играть» from Словарик, I want the saved pet name still used, so that replay stays personal.
32. As a TalkBack user on «Имя», I want the bubble announced as the visible sentence («Меня зовут ____» or «Меня зовут Пух»), so that I hear the same words as on screen.
33. As a TalkBack user on «Имя», I do not want «Питомец [имя] говорит: …» on this bubble, so that an unnamed pet is not announced with a missing name.
34. As a TalkBack user on «Как играть», I still want «Питомец [имя] говорит: …», so that the rules cards keep their existing announcement.
35. As a ребёнок on «Имя», I do not want a second on-screen name caption under the pet sprite, so that the name is not shown three times.
36. As a TalkBack user on «Имя», I want the pet image to describe appearance without requiring a name, so that the bubble remains the name announcement.
37. As a ребёнок who force-quits before finishing Первый запуск, I want the next launch to start from the default Питомец, so that no half-typed name remains.
38. As a ребёнок whose profile cannot be created, I want to stay on the current «Как играть» step with the draft intact, so that I can retry without renaming.
39. As a ребёнок retrying after a failed save, I want the committed pet name to be the one I typed, in both stored name fields, so that retry does not invent a child name.
40. As a returning ребёнок, I want launch to skip Первый запуск, so that this change does not re-ask naming.
41. As a parent using «Сбросить прогресс», I want the rebuilt profile to keep the same pet name, so that reset still preserves identity.
42. As a parent using Демо-режим, I want the demo profile still named «Демо» for both stored name fields, so that demo creation does not start asking for a pet name.
43. As a ребёнок, I want this speech to stay a fixed script, so that the pet does not become Помощник or an open chat.
44. As a ребёнок, I want the same 1–20 grapheme counting as today (including multi-codepoint emoji), so that length rules do not silently change.
45. As a ребёнок with the keyboard open, I want «Дальше» still tappable, so that dismissing the keyboard is not a required extra step.
46. As a ребёнок using larger system text at 360 dp, I want the bubble, field, and footer still reachable, so that autofocus plus large type does not block the phase.
47. As a ребёнок offline, I want naming to work with no network, so that the existing offline promise remains intact.
48. As a разработчик, I want the FirstRun draft to stop carrying a separate child game name, so that the unused field cannot drift back into the UI.
49. As a разработчик, I want complete-first-run to keep receiving both name fields, filled with the same trimmed pet name, so that persistence and fakes do not need a schema or port change.
50. As a разработчик, I want REQUIREMENTS and ROADMAP FirstRun copy to say the profile is the pet (name + appearance) and the phase is «Имя» with one pet-spoken field, so that product docs match the glossary.
51. As a разработчик, I want CONTEXT.md’s Профиль ребёнка definition left as the pet’s name and appearance, so that the glossary is not reverted to “game name plus pet.”
52. As a разработчик, I want the historical pet-first Первый запуск spec left as implemented history, with a comment that «Имена» was superseded, so that we do not rewrite a finished spec in place.
53. As an accessibility reviewer, I want tests to find the naming field by role textbox named «Имя», so that TalkBack and the suite share one contract.
54. As a разработчик, I want existing first-run flow coverage updated rather than a second suite, so that helpers no longer type «Миша» into a child-name field that is gone.

## Implementation Decisions

- Scope is the naming phase of Первый запуск plus the documents that still describe two names. Do not restyle Питомец appearance, «Как играть» rule cards, Стартовый бюджет, Main, or Demo creation UI.
- Keep the existing FirstRun phase machine and in-memory draft. Drop the child game-name draft field. The draft’s pet name is the only name. On complete, pass that trimmed string as both the persistence `name` and `petName`. Do not add a schema migration. Do not change the complete-first-run port shape.
- Rename the phase label from «Имена» to «Имя». Remove the child-name chrome string and the pet-name legend string from the naming UI. Add chrome strings for the bubble empty line «Меня зовут ____», the live line «Меня зовут {name}», and the field accessible name «Имя». Keep the existing validation sentence.
- Render the naming phase as: title «Имя», PetView (idle, customized appearance, no pet-name caption, omit pet name from the image accessible label), one existing SpeechBubble, one TextInput, pinned footer «Назад» + «Дальше». Reuse the SpeechBubble used by «Как играть». Do not add a chat transcript, a child-side bubble, a composer/send control, or an in-bubble TextInput.
- Live echo: if the field trims to empty, the bubble body is «Меня зовут ____»; otherwise it is «Меня зовут » plus the current field value. The bubble’s accessibility label is that same visible sentence, not the «Питомец [имя] говорит» helper used on rule cards.
- Autofocus the naming field when the phase is shown. Keep the screen’s existing keyboard-tap handling so the footer stays usable with the keyboard open.
- Validation is unchanged: trim, 1–20 visible graphemes, no charset filter, feedback after blur, primary disabled while invalid. One field, not two.
- «Дальше» on a valid name moves to «Как играть» and does not write the profile. Finish/skip of «Как играть» remains the sole commit boundary. Visible Back and Android Back: previous rule → «Имя» → «Питомец». Draft retention, remount-from-defaults, retry-on-save-failure, and Словарик replay stay as they are, with only the pet name to retain.
- Демо-режим keeps writing «Демо» into both name fields. «Сбросить прогресс» keeps copying stored identity; for newly created profiles both stored names are the pet name.
- This is not Помощник. Do not add branching dialogue, audio, or talking-pose art.
- Update REQUIREMENTS (profile = pet name + appearance; Первый запуск naming is pet-only «Имя») and ROADMAP FirstRun (phase label «Имя»; one field; pet-spoken bubble; leftover persistence name equals pet name). Append a comment on the historical pet-first Первый запуск spec that «Имена» / child game name were superseded by this spec. Do not revert CONTEXT.md.
- No ADR. Keeping the unused name column is the reversible choice.

## Testing Decisions

- A good test asserts what the child and TalkBack can observe: phase title, bubble text, one field, enabled/disabled «Дальше», validation, Back retention, no child-name prompt, commit timing, and that the saved profile’s `name` and `petName` are the same trimmed pet name. It does not assert component names, autoFocus props, style objects, or navigation internals.
- Use one seam: the existing navigation-root React Native Testing Library first-run flow suite with injected session ports. Do not add a naming-phase component suite. Repository tests for complete-first-run stay focused on atomic create/grant; they already accept both name fields and do not need a new seam when the UI writes the same string twice.
- Follow RNTL v14: async `render`, `screen`, `userEvent`, role/accessible-name queries. Prior art is the current first-run flow helper that types into named textboxes and the cases for blur validation, graphemes, Back, skip, and failed complete.
- Replace every query for «Имена», «Как тебя зовут в игре?», and «Как зовут питомца?» with «Имя» (title and textbox name). The helper that reaches «Как играть» types one valid pet name and presses «Дальше».
- Cover: empty field → bubble «Меня зовут ____» and disabled «Дальше»; typing «Пух» → bubble «Меня зовут Пух» and enabled «Дальше»; no second textbox; no «А тебя как зовут?».
- Cover validation on the single field: whitespace-only after blur shows the existing message; 21 graphemes keeps «Дальше» disabled; trimmed 20 graphemes plus inner spaces around the pet name save as the trimmed pet name in both profile fields.
- Cover Back from «Как играть» restoring the field value and the echoed bubble; Back from «Имя» restoring appearance; remount restarting at «Питомец» with no profile.
- Cover commit/retry: after skip or «Играть!», `name` and `petName` equal the typed pet name (not a leftover «Миша»). Failed complete still retries with that same identity.
- Cover «Как играть» still announcing «Питомец Пух говорит: …» and showing the visible pet name; naming-phase bubble must not use that announcement helper.
- If the seam can observe focus, assert the «Имя» field is focused on entering the phase. Do not assert an `autoFocus` prop. Keyboard overlap at 360 dp with enlarged text is device acceptance.
- Do not add tests that the demo toggle UI asks for a name. Demo still seeds «Демо» / «Демо».

## Out of Scope

- Collecting a child’s game name now or later (settings, adult, or a second bubble).
- Schema migration or dropping the leftover profile name column.
- Changing «Как играть» rule copy, step chrome, or replay controls.
- Changing Стартовый бюджет, Main, meters, economy, or Demo mode behavior other than continuing to write «Демо» into both name fields.
- Помощник, chat history, in-bubble inputs, composer bars, animation, sound, or talking poses.
- Editing the pet name after the Профиль ребёнка exists.
- Reopening appearance sliders or chrome-kit work.
- Rewriting the historical pet-first Первый запуск spec except a supersession comment.

## Further Notes

- Grill locked: pet name only; phase title «Имя»; one replacing SpeechBubble; live echo of «Меня зовут ____»; field under the bubble with no legend; accessible name «Имя»; «Дальше» confirms into «Как играть»; autofocus on; TalkBack is the visible sentence; leftover `name` column duplicates `petName`; glossary already says Профиль ребёнка is the pet.
- CONTEXT.md was updated during grilling. Do not restore “a game name plus the child's pet.”
- The first-run redesign spec’s stories about «Как тебя зовут в игре?» and both names required before «Дальше» are superseded here; appearance, «Как играть», and commit timing from that spec remain in force.
