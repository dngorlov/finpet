# 01: AdultGate in front of Демо-режим

**What to build:** Main's Взрослый раздел opens an arithmetic gate. A correct product `replace`s into the existing Demo panel. Wrong twice yields a new question. Existing demo / day-close tests stay green via a shared `passAdultGate` helper.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

Type: task

## Pointers

- Spec: `.scratch/m5-adult-persistence/spec.md` (stories 1–8, 34; Implementation Decisions: gate, question helper, navigation)
- Map: `.scratch/m5-adult-persistence/map.md`
- Prior art: `src/ui/screens/FirstRunScreen.tsx` textbox `role` + `aria-label`; `src/ui/testSupport/flowHelpers.ts`
- Do not add an RNG port to `SessionPorts`

## Must

- Pure helper `makeQuestion` / `product` (`a` 10–99, `b` 2–9) with a tiny jest test for bounds and product. Screen uses `Math.random` by default.
- Register `AdultGate`. Main tile navigates there. Correct «Войти» `replace`s to `Demo`. Back from the gate returns to Main; re-entry is gated again. Prompt `Сколько будет {a} × {b}?`; numeric field; no hints; first wrong keeps the question, second wrong replaces it.
- Add `passAdultGate` next to `confirmTinyPlan`. Route every existing `Взрослый раздел` press in `demoFlow`, `dayCloseDemoFlow`, and any sibling that opens the panel through that helper (parse visible `N × M`, type the product, press «Войти»).
- Cover the gate slice at the navigation-root seam (can live in a small `adultGateFlow` file or inside an existing adult file): wrong twice changes the prompt; correct opens the demo panel title; Back does not unlock.
- Do not add progress overview, typed delete, or «Сбросить прогресс» yet.

## Done when

A juror hitting Взрослый раздел must answer a product before the M4 demo panel. Existing M4 demo tests pass. `npm test` and `npm run typecheck` pass.
