# 06 — Migrate «Как играть» onto the kit

Status: ready-for-agent
Type: task
Blocked by: 02, 03

## Goal

`HowToPlay` uses `SpeechBubble`, pinned `Screen` footer, `PrimaryButton`, and `TextButton`. Replay labels and TalkBack stay the same.

## Pointers

- Spec: `.scratch/chrome-kit/spec.md` (HowToPlay / SpeechBubble / pinned footer)
- `src/ui/components/HowToPlay.tsx`
- Replay host: `src/ui/screens/HowToPlayScreen.tsx`

## Must

- Pet centered above a `SpeechBubble` with tail pointing up; pet name visible next to/above the bubble.
- Decorative `PetView` stays `accessibilityHidden` on these steps. One announcement: `strings.petSays`.
- Primary + quiet action (`«Пропустить»` / replay `«Закрыть»`) in the pinned footer. «Назад» stays a readable word (`TextButton` / existing back), not a second raised brick. Replace local `TextAction` with `TextButton`.
- Keep «Готово» / «Закрыть» on replay and no second profile commit.
- Do not change step count, card bodies, or skip/finish callbacks.

## Done when

Local bubble/text-action styles are gone. `npm test` and `npm run typecheck` pass.
