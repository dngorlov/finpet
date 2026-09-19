# Pet-first Первый запуск

Status: ready-for-agent

## Problem Statement

A child currently sees the rules before meeting or customizing their Питомец, so the explanation is abstract and emotionally disconnected from the character they will care for. The primary action says «Начать» on every rule card even after the child has already started moving through them. The step indicators are implemented and styled as large buttons, which suggests that they are navigation controls rather than passive progress.

The existing first-run journey also combines appearance and both names on one setup screen. It does not support the desired sequence of first making a pet, then naming it, then hearing that pet explain how the game works. This weakens the first impression of ФинПет and makes the rules feel like a barrier before the child reaches the engaging part.

## Solution

Replace the rules-first stack with one pet-first Первый запуск journey:

1. **Питомец:** live preview on top, then three bead sliders (Вид, Окрас, Аксессуар) beneath it — discrete tracks with accent/dim beads, tap or drag, preview follows the nearest stop. Full control recipe: `.scratch/first-run-bead-sliders/spec.md`.
2. **Имена:** enter the child's game name and the pet's name while keeping the customized pet visible.
3. **Как играть:** the named pet explains three short rules in first-person speech bubbles.

The entire journey uses one in-memory draft. Nothing is written until the child finishes or skips «Как играть». Intermediate rule steps use «Дальше» and the final step uses «Играть!». Progress indicators are passive and cannot be mistaken for buttons.

The same pet-spoken «Как играть» explanation remains replayable from Словарик, with replay-specific exit actions and no profile mutation.

## User Stories

1. As a ребёнок starting ФинПет for the first time, I want to meet the pet creator immediately, so that the first interaction is playful rather than instructional.
2. As a ребёнок, I want a complete default Питомец to appear immediately, so that I am never looking at an empty or invalid character.
3. As a ребёнок, I want to choose one of three Вид options, so that I can select the creature I like.
4. As a ребёнок, I want to choose one of three Окрас options, so that I can personalize the pet's appearance.
5. As a ребёнок, I want to choose one of three Аксессуар options, so that the pet feels like mine.
6. As a ребёнок, I want all 27 appearance combinations to remain available, so that the redesign does not reduce customization.
7. As a ребёнок, I want the preview to update as soon as I select an option, so that every choice has visible feedback.
8. As a ребёнок who likes the default appearance, I want to continue without changing an option, so that customization never becomes forced busywork.
9. As a ребёнок, I want the appearance phase labelled «Питомец», so that I understand what I am doing.
10. As a ребёнок, I want «Дальше» to move from appearance to naming, so that the action accurately describes what happens next.
11. As a ребёнок, I want naming to be a separate phase after appearance, so that I can first decide who the pet is and then decide what to call it.
12. As a ребёнок, I want the customized pet to remain visible while naming, so that I am naming the creature I just made.
13. As a ребёнок, I want to enter «Как тебя зовут в игре?», so that the local Профиль ребёнка has my game name.
14. As a ребёнок, I want to enter «Как зовут питомца?», so that the pet can be addressed by name.
15. As a ребёнок, I want surrounding whitespace removed from both names, so that accidental spaces are not saved.
16. As a ребёнок, I want each name to accept between 1 and 20 visible characters, so that names fit throughout the interface.
17. As a ребёнок, I want all character types accepted within the length limit, so that the app does not reject my chosen name unnecessarily.
18. As a ребёнок, I want «Дальше» disabled until both names are valid, so that I cannot accidentally create an unusable profile.
19. As a ребёнок, I want a short validation explanation after leaving an invalid field, so that I know how to continue.
20. As a ребёнок, I want the naming phase labelled «Имена», so that its purpose is clear.
21. As a ребёнок, I want my named, customized pet visible throughout «Как играть», so that the rules come from my pet rather than a generic tutorial.
22. As a ребёнок, I want the pet to explain the rules using speech bubbles, so that the explanation feels like part of the game.
23. As a ребёнок, I want one short bubble per step, so that the explanation stays readable and does not become a long conversation.
24. As a ребёнок, I want the first bubble to explain that my decisions affect the pet, so that money choices have a clear purpose.
25. As a ребёнок, I want the second bubble to explain Три решения—обязательное, желаемое, or postpone—so that I know how to think before buying.
26. As a ребёнок, I want the third bubble to explain the Игровой день loop—plan, spend, save, and review—so that I know what I will do next.
27. As a ребёнок, I want the pet to speak consistently as “я,” so that its voice feels coherent.
28. As a ребёнок, I want the pet shown in its idle pose without required animation or audio, so that the explanation works under all accessibility settings and with current art.
29. As a ребёнок, I want rule steps 1 and 2 to use «Дальше», so that the app no longer says «Начать» after I have already begun.
30. As a ребёнок, I want the last rule step to use «Играть!», so that the final action clearly enters the game.
31. As a ребёнок, I want «Пропустить» available on every rule step, so that the explanation never traps me.
32. As a ребёнок, I want «Пропустить» visually quieter than the primary action, so that the intended path remains obvious.
33. As a ребёнок, I want passive dots and «Шаг N из 3» during «Как играть», so that I understand my progress without seeing false buttons.
34. As a ребёнок, I want the progress dots to ignore taps, so that they do not imply unsupported navigation.
35. As a ребёнок, I want phase labels «Питомец», «Имена», and «Как играть», so that I understand progress through the whole Первый запуск.
36. As a ребёнок, I want a visible «Назад» action to return to the previous rule or phase, so that I can correct a choice.
37. As a ребёнок, I want Android Back to mirror the visible Back behavior, so that platform navigation remains predictable.
38. As a ребёнок, I want all appearance and name choices retained while moving backward and forward, so that correcting one choice does not erase the rest.
39. As a ребёнок at the Питомец phase, I want Android Back to be allowed to exit, so that the app does not trap me.
40. As a ребёнок reopening the app before finishing Первый запуск, I want the journey to restart from the default pet, so that no half-finished profile or hidden draft remains.
41. As a ребёнок, I want no profile, Стартовый бюджет, or active-profile marker written during appearance, naming, or rule browsing, so that incomplete setup leaves no game state.
42. As a ребёнок finishing the third rule, I want «Играть!» to create my complete Профиль ребёнка exactly once, so that I can continue safely.
43. As a ребёнок skipping the rules, I want «Пропустить» to create the same complete profile exactly once, so that skipping changes only how much explanation I see.
44. As a ребёнок, I want Стартовый бюджет shown only after successful profile creation, so that the grant always belongs to a real profile.
45. As a ребёнок whose profile cannot be created, I want to remain on the current rule step with my draft intact, so that I can retry without re-entering choices.
46. As a ребёнок whose profile cannot be created, I want to see «Не получилось начать игру. Попробуй ещё раз.», so that the failure has a clear recovery path.
47. As a ребёнок retrying after a partial persistence failure, I want the operation to remain exactly-once, so that duplicate profiles or grants cannot be created.
48. As a returning ребёнок, I want app launch to skip Первый запуск, so that I reach Main immediately.
49. As a ребёнок opening Словарик, I want «Как играть» to replay the same pet-spoken explanation, so that help is not one-shot.
50. As a ребёнок replaying «Как играть», I want my existing pet and name displayed, so that the explanation remains personal.
51. As a ребёнок replaying «Как играть», I want intermediate steps to use «Дальше» and the final step to use «Готово», so that replay does not imply starting a new profile.
52. As a ребёнок replaying «Как играть», I want «Закрыть» available instead of «Пропустить», so that the action returns to Словарик without changing progress.
53. As a ребёнок replaying «Как играть», I want no profile, money, or meta data changed, so that help is safe to open repeatedly.
54. As a TalkBack user, I want each bubble announced once as «Питомец [имя] говорит: …», so that speaker and message are clear.
55. As a TalkBack user, I want the decorative pet image omitted from the reading order on rule steps, so that I do not hear duplicate pet descriptions.
56. As a TalkBack user, I want phase, step, Back, primary, and secondary actions exposed with accurate semantics, so that the journey is navigable without sight.
57. As a ребёнок using larger system text, I want bubbles, fields, and actions to remain readable and reachable at 360 dp width, so that text scaling does not block Первый запуск.
58. As a ребёнок offline, I want the complete Первый запуск to work without network access, so that the existing offline promise remains intact.
59. As a разработчик, I want the three speech messages to remain versioned content, so that copy changes do not require screen-logic changes.
60. As a разработчик, I want Питомец to remain a scripted narrator rather than Помощник, so that fixed guidance does not imply an open-ended chat capability.

## Implementation Decisions

- Replace the separate rules-first and combined profile-setup flow with one FirstRun state machine. It owns the current phase and a single in-memory draft containing the stable profile id, appearance, child game name, and pet name. The reusable «Как играть» presentation owns its local rule-step index.
- Render the state machine through separate phase components for Питомец, Имена, and «Как играть». These components share the draft but do not persist independently.
- A complete default Вид, Окрас, and Аксессуар are selected initially. The child is not required to alter them.
- On Питомец only, appearance axes use the shared bead-slider control (not Chip rows): preview above three tracks; see `.scratch/first-run-bead-sliders/spec.md`.
- The naming phase trims surrounding whitespace. Each resulting name must contain 1–20 visible characters. No character-class restriction is added.
- Show validation feedback after an invalid field loses focus. Keep the primary action disabled while either field is invalid.
- Treat completion of «Как играть» as the sole first-run commit boundary. Both «Играть!» on step 3 and «Пропустить» call the same completion operation.
- Extend the existing UI persistence port with one high-level complete-first-run operation. Its live implementation must create the profile, grant Стартовый бюджет through the existing creation path, and activate the profile/meta state as one atomic, exactly-once unit. Its fake implementation must expose the same observable contract. This modifies the existing persistence seam rather than introducing a second testing seam.
- Do not persist the FirstRun draft. Exiting or force-quitting before the commit boundary discards it; the next launch starts from defaults.
- Do not add a separate “starting budget seen” marker. Existing launch behavior continues to use the active profile as the boundary between first run and returning play.
- Keep the existing content object shape and content version. The three `body` values become the pet's first-person speech. Existing `title` values remain accepted for compatibility but are not rendered in FirstRun.
- Use one short bubble per rule step. Do not build branching dialogue, audio narration, or a talking animation.
- Use a passive step indicator. It must not be pressable, have button semantics, or meet touch-target sizing intended for controls. Expose the position textually as «Шаг N из 3».
- Use «Дальше» for all non-final forward transitions and «Играть!» for the final first-run transition. Present «Пропустить» as a secondary text action on all three rule steps.
- Visible Back and Android Back use the same transition rules: previous rule, then Имена, then Питомец. Back from Питомец may leave the app.
- Keep the draft in memory when profile creation fails. Show the agreed retry message and do not navigate to Стартовый бюджет until the atomic completion operation succeeds.
- Reuse the «Как играть» presentation component for Словарик replay, but provide it with the persisted pet and replay controls. Replay uses «Готово» / «Закрыть» and cannot call the first-run completion operation.
- On each rule step, expose the bubble as a single accessibility message naming the pet as speaker. Hide the decorative PetView representation from the accessibility tree for that step.
- Preserve all existing profile defaults, Стартовый бюджет amount, goal seeding, appearance keys, returning-user routing, Main behavior, and offline constraints.
- Update centralized Russian chrome strings for phase labels, navigation actions, accessibility labels, validation, and save failure. Continue loading educational speech from versioned content.
- Remove or retire obsolete first-run routes only after all entry points—including profile deletion and Словарик replay—target the new journey correctly.
- No database schema migration is required.

## Testing Decisions

- A good test asserts behavior visible to the child: phase order, preview changes, labels, validation, navigation, speech, progress semantics, persistence timing, failure recovery, and destination screens. It does not assert component names, reducer internals, style objects, or navigation implementation details.
- Use one navigation-root React Native Testing Library seam with the existing injected session ports. This is the highest existing seam and exercises routing, phase state, persistence calls, and replay without adding screen-by-screen test seams.
- Follow the repository's React Native Testing Library v14 guidance: async rendering and queries, `screen`, role/accessibility-name queries, and user interactions that match real taps and text entry.
- Cover the happy path: initial Питомец phase, live appearance change, Имена phase, valid names, three pet bubbles, «Дальше» labels, final «Играть!», exactly one first-run commit, Стартовый бюджет, then Main.
- Cover the skip path from each of the three rule steps. Each path must perform the same single commit and reach Стартовый бюджет.
- Cover passive progress by asserting that step indicators are visible but cannot be queried as buttons and do not change steps when pressed as ordinary content.
- Cover Back navigation across rule steps and phases, including retention of appearance and both names.
- Cover naming validation: whitespace-only, over-20-character, trimming, valid Unicode names, disabled forward action, and feedback after blur.
- Cover no-write behavior by asserting that the completion operation is untouched throughout appearance, naming, Back navigation, and rule browsing.
- Cover failure recovery with a fake completion failure: the error message appears, the draft remains, navigation does not advance, and a successful retry commits exactly once.
- Cover remount before completion: a new app render starts from the default Питомец phase and no profile exists.
- Cover a returning profile: launch goes directly to Main.
- Cover «Как играть» replay from Словарик: persisted pet and name appear, controls read «Дальше», «Готово», and «Закрыть», exit returns to Словарик, and no completion or profile mutation occurs.
- Cover accessibility at the integration seam: each speech bubble has the agreed single announcement, decorative pet content is not announced twice, and all real actions have correct roles and names.
- Keep repository-level tests for the atomic complete-first-run operation focused on exactly-once profile creation, active-profile metadata, one Стартовый бюджет grant, rollback on failure, and retry safety. Do not duplicate economy invariant tests already owned by the game repository suite.
- Use the existing first-run navigation test as prior art, replacing its old rules-first sequence rather than creating parallel legacy and redesigned flow suites.
- Device acceptance remains necessary for visual affordance and platform behavior: at 360 dp portrait, indicators must not look tappable, bubbles must fit with enlarged text, Android Back must preserve the draft, and the complete flow must work in airplane mode.

## Out of Scope

- Changes to Стартовый бюджет amount or grant rules.
- Changes to goals, Пособие, meters, Этап, Main, or the Игровой день economy.
- Persisting or resuming an incomplete FirstRun draft.
- Additional appearance options or new pet artwork.
- Talking-pose artwork, animation, sound, or recorded voice.
- Branching dialogue or choices inside «Как играть».
- Turning Питомец into Помощник or adding open-ended chat.
- Reworking Словарик beyond the «Как играть» replay entry.
- Changes to Demo mode.
- Database schema changes.
- General visual redesign outside Первый запуск and its replay.

## Further Notes

- The current implementation is rules-first and uses interactive 48×48 step controls, so this is a behavioral redesign rather than a copy-only change.
- The current profile setup writes the profile directly. The implementation must move that write behind the final shared completion operation.
- The pet's agreed speech is:
  1. «Привет! Я твой питомец. Твои решения помогают заботиться обо мне и копить на цели.»
  2. «Перед покупкой выбери: это обязательное, желаемое или лучше отложить?»
  3. «Сначала составь план дня. Потом покупай, откладывай в Копилку и смотри, что получилось.»
- Existing product documents and the domain glossary already use Первый запуск for the complete journey and «Как играть» for the replayable pet-spoken explanation.
- The pre-existing deletion of `eas.json` is unrelated and must not be modified as part of this work.
- On the Питомец phase, Вид, Окрас, and Аксессуар are chosen with bead sliders below the live preview (see `.scratch/first-run-bead-sliders/spec.md`); that control is not part of the chrome kit.

## Comments

**2026-09-19 — implemented.** Первый запуск now runs Питомец → Имена → pet-spoken «Как играть», commits atomically after finish/skip, and replays safely from Словарик. The obsolete Onboarding and ProfileSetup routes were retired. Navigation-root and repository tests cover the automated acceptance surface; full suite 68/68, typecheck and lint clean. Device-only follow-up remains for 360 dp enlarged text, visual affordance, Android hardware Back, and airplane mode.

**2026-09-19 — naming superseded.** «Имена» and the child game name were superseded by `.scratch/first-run-pet-name/spec.md`. Appearance, «Как играть», and commit timing from this spec remain in force.

**2026-09-19 — Как играть superseded.** Pet-card «Как играть» and commit-after-rules are superseded by `.scratch/how-to-play-tour/spec.md`. Valid Имя «Дальше» writes the profile; «Как играть» is the post-Пособие spotlight walkthrough.
