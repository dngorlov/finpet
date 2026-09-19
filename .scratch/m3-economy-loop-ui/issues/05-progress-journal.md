# 05: Прогресс with Журнал

**What to build:** Прогресс opens a three-tab screen. Журнал lists coin movements grouped by Игровой день with kid source labels. Словарик is the current glossary plus «Как играть» replay. Итоги is a next-step empty state because no day has closed yet.

**Blocked by:** 01

**Status:** ready-for-agent

## Pointers

- Spec: `.scratch/m3-economy-loop-ui/spec.md` (Progress / Журнал / labels)
- `listJournal` from ticket 01
- Current `GlossaryScreen` moves into the Словарик tab

## Must

- Main’s Прогресс tile opens Progress, not Glossary-as-root.
- Tabs: Итоги | Журнал | Словарик. Verdict/status never color-only; tab names are the accessible names.
- Журнал: grouped by day, chronological, labels from the spec (`Стартовый бюджет`, `Пособие`, `Покупка: …`, `Перевод в копилку`, `Из копилки`). Amounts visible as signed Монеты.
- Словарик: ten terms + replay, no profile write.
- Итоги: short empty-state that Итоги appear after the first closed Игровой день. Do not call `closeDay`.
- Navigation-root: returning child (who already has grant + Пособие in the fake journal) sees those rows; glossary replay still works.

## Done when

Appendix A step 9’s history surface is visible. `npm test` and `npm run typecheck` pass.
