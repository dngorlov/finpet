# 05: Итоги tab and task journal labels

**What to build:** Прогресс → Итоги shows the last closed Игровой день (score, plan-vs-actual, meter reasons, Этап) plus overall days played, tasks done x/6, goals achieved. Журнал labels task-reward and scene-coin rows in kid language.

**Blocked by:** 01

**Status:** ready

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (stories 46–47; Progress Итоги)
- Reads: `lastClosedDay`, `listTaskProgress`, `listGoals`, `listJournal`
- Keep Словарик as it is

## Must

- Replace `resultsEmpty` when `lastClosedDay` is non-null. Show last-day card matching DaySummary facts (do not recompute stages in the UI) and overall counts (closed days, completed non-correction tasks x/6, achieved goals).
- Журнал: `task_reward:*` → «Задание: {title}»; `task_scene` → «Задание».
- Cover at the navigation-root seam with a fake that already has a closed day (or after calling `closeDay` on the fake): Итоги is not the empty copy; journal shows a task label if a reward row exists. Full day-close click-path can wait for 03+06.

## Done when

Итоги is no longer an empty tab after the first close. `npm test` and `npm run typecheck` pass.
