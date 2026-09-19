# 02: Задания list and generic runner

**What to build:** Replace the Задания stub with TaskList / TaskRun / TaskResult. A returning child unlocks one topic-ordered Задание per Игровой день, plays the content node graph with verdict + explanation, retries, can spawn «Почини рюкзак», and earns +10 only on the first good/warn completion. Shop BlockedSheet «Выполнить задание» opens the real list.

**Blocked by:** 01

**Status:** ready

Type: task

## Pointers

- Spec: `.scratch/m4-tasks-demo-mode/spec.md` (stories 1–24, TaskRun / reward / spawn decisions)
- Content: existing `assets/content/tasks.json` (do not rewrite scripts)
- Writes: `startTask` / `chooseOption` (core) + `applyTaskStep` / `claimTaskReward` (repository)
- Reads: `unlockedTasks`, `listTaskProgress`, `dayState`, `getProfile`
- Prior art: `src/ui/__tests__/shopFlow.test.tsx` (navigation-root + fake ports)

## Must

- Register TaskList, TaskRun `{ taskId }`, TaskResult. Remove the tasks stub destination. Main hub card and Задания tile navigate to TaskList (hub «Играть» may jump straight into the preferred task). Shop BlockedSheet goes to TaskList.
- TaskList: three topic groups (Бюджет, Копилки, Платежи) × 2 cards; locked → «Откроется: завтра»; unclaimed reward «+10»; completed still replayable. Correction cards only when a progress row exists, not in the six slots.
- Hub card prefers available correction, else first unlocked unfinished, else a completed replay.
- Generic TaskRun: intro + current node from content; option buttons ≥48 dp; after tap, verdict icon+word (Верно / Есть цена / Попробуй ещё) + explanation + «Дальше». `retry` same node; named next; `exit` → TaskResult. `spawnTask` announces «Новое задание появилось в списке!». Meter deltas on the verdict panel; scene coins via FeedbackCard. Pose: happy/idle/sad during explanation.
- Reward policy exactly as spec: claim only on `exit`; `correct` for good|warn; bad exit completes without pay.
- Cover this slice at the navigation-root seam: day-1 list only «Первый план»; good path +10; replay 0; retry stays on node; backpack spawn shows «Почини рюкзак»; BlockedSheet path lands on the list (update M3 tests that expect `/скоро/`). Do not yet require day close or demo.

## Done when

Appendix A step 6 is playable in the UI test. `npm test` and `npm run typecheck` pass.
