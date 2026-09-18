# Spec: M0 — Scaffold (FinPet)

Status: ready-for-agent
Source: `docs/ROADMAP.md` §7 (M0), §3 (architecture), §5.4 (asset contract) · `docs/adr/0001` (stack) · `docs/REQUIREMENTS.md` (Technical Constraints, UX Constraints) · `CONTEXT.md` (vocabulary)

## Problem Statement

The hackathon runs on an 11-day clock, and today the repo contains only planning documents — no buildable app. Every day without a reproducible project skeleton raises the risk that the mandatory demo scenario (5 consecutive demo days, full Appendix A pass) cannot be finished, verified on a real Android 8.0 device, and shipped as a signed APK. The team also cannot start milestone work in parallel until the toolchain, test harness, and module boundaries exist.

## Solution

Stand up the FinPet Expo/React Native application skeleton exactly as fixed in ROADMAP §3 and ADR-0001: an Expo managed-workflow TypeScript app with the settled app identity, portrait-only and Android 8.0 minimum, React Navigation with a placeholder Russian Main screen, expo-sqlite + Drizzle bound with a migration runner that applies the initial migration at boot, a green jest harness, the placeholder pet-asset tree matching the designer drop contract, and a README that gets a stranger from clone to installed APK. M0 delivers no gameplay — it makes every later milestone pure addition.

## User Stories

1. As a hackathon judge, I want the APK to install and cold-launch to the main screen on an Android 8.0 (API 26) device in ≤5 s, so that the doc's launch constraint is met from the very first build.
2. As a child user, I want the app to open in portrait orientation under the Russian name «ФинПет», so that it already feels like a finished game rather than a dev build.
3. As a team developer, I want an Expo + TypeScript scaffold committed with a lockfile, so that all five of us get identical builds on any machine.
4. As a team developer, I want `npm test` to run a green jest suite, so that test-first work from M1 onward starts on a working harness.
5. As the M1 implementing agent, I want the domain layer isolated from React/Expo imports (enforced by lint, not convention), so that economy/stage logic is jest-testable without any device.
6. As the M1 implementing agent, I want expo-sqlite opened, Drizzle bound, and a migration runner applying pending migrations at boot, so that adding the settled schema is writing one new migration, not touching bootstrap code.
7. As the M2+ implementing agent, I want React Navigation's native stack installed with Main registered as the first screen, so that onboarding/pet/hub screens slot in without navigation refactors.
8. As the M2+ implementing agent, I want all RU strings centralized in one strings module and a theme module with the ≥16 sp type scale stubbed, so that copy and accessibility tweaks never touch component code.
9. As the designer, I want the placeholder pet-asset tree matching the §5.4 naming contract (3 species × 3 colors × 3 poses + 3 accessory overlays), so that dropping real art is a file replacement, not a code change.
10. As the designer, I want the placeholder tree produced by a committed regeneration script, so that it can be rebuilt deterministically if the contract gains keys.
11. As a compliance reviewer, I want the unique package name and version/build recorded in the app config and README, so that the requirements-compliance matrix can cite them (doc: signed APK, unique package, version in docs).
12. As a privacy reviewer, I want the release manifest stripped to zero permissions, so that "only justified Android permissions" is satisfied structurally rather than by audit luck.
13. As the content author, I want the content asset directories in place, so that catalog/goals/tasks/glossary JSON drops land without inventing structure.
14. As a team developer, I want README build/run instructions for dev and release builds with prerequisites, so that a fresh machine reaches an installed APK in ≤30 minutes (the M7 "stranger test" starts true).
15. As a hackathon judge, I want the app to make zero network calls and carry no analytics/crash SDKs, so that airplane-mode demos cannot fail and the offline constraint holds by construction.

## Implementation Decisions

- **Stack per ADR-0001:** Expo managed workflow + TypeScript (strict mode), current stable Expo SDK at implementation time, Hermes enabled (SDK default), lockfile committed for reproducibility.
- **App identity:** display name «ФинПет», `applicationId org.hseteamspb.finpet`, `versionName 0.1.0`, `versionCode 1`; identity table duplicated into the README (version/build must be discoverable in docs per the technical constraints).
- **Device posture:** portrait-only orientation; `minSdkVersion` pinned to 26 (Android 8.0) via expo-build-properties.
- **Permissions:** release manifest stripped to zero permissions (empty permissions list in expo-build-properties); dev-client/debug builds keep their connectivity automatically for Metro. No analytics, crash reporting, or any network SDK — offline is structural (ground rules, ROADMAP §1).
- **Navigation:** React Navigation native stack with a single placeholder Main screen in Russian (app name + version footer). The hub layout, meters, and cards arrive in M2 per ROADMAP §4.2 #4 — do not pre-build them.
- **Module skeleton per ROADMAP §3:** domain (`core/`), data (`data/`: db bootstrap, schema home, repositories, content loader home), UI (`ui/`: screens, components, theme, strings). The import-boundary rule — `core/` must not import from `ui/` or Expo/React — is enforced with an ESLint restricted-paths rule, because the jest seam for all later milestones depends on it.
- **Persistence bootstrap:** expo-sqlite opened during boot, Drizzle bound to it, migrator applying pending migrations at startup. The initial migration creates only the `meta` table (part of the settled schema, ROADMAP §3.2) as a smoke payload; the full schema lands as M1 migrations. Repository modules exist as empty stubs so M1 fills rather than creates them.
- **Placeholder art:** a committed Node script generates the full §5.4 tree — gray transparent PNGs for `sp{1..3}/c{1..3}/{idle,happy,sad}.png` (81 files) and `overlays/a{1..3}.png` (3 files) — and its output is committed, so M2's PetView and the designer's real drop both work against identical names.
- **Content home:** the five content JSON files (`catalog`, `goals`, `tasks`, `terms`, `hint`) get placeholder directories now; their versioned, zod-validated loader is M1 work.
- **Test harness:** jest with the jest-expo preset; one smoke render test of Main. `npm test` must be green at merge.
- **README skeleton:** prerequisites (Node LTS, JDK per current Expo docs, Android SDK with API 26), dev-run command, release-build command (`--variant release`), app identity table, pointer to `docs/`. Signing with a real keystore is M7 — the release variant may use the debug keystore for now.

## Testing Decisions

- **What makes a good test here:** assert external behavior only — what renders, what a module exports, what migrations apply — never internal structure. The smoke test is the pattern M2 screen tests will copy; the jest config is the pattern M1's domain suite will extend.
- **Seams (fewest possible, highest possible):**
  1. **jest-expo render seam** — Main renders its RU title and version footer; runs in CI-less local `npm test` without a device.
  2. **Migration seam** — the migrator, exercised via the boot path, reports the initial migration applied (smoke level in M0; real roundtrip tests arrive with M1 repositories).
  3. **Device acceptance seam** — the only place the ACs can be proven: install the release APK on an API 26 emulator, confirm portrait lock, stopwatch the cold start (≤5 s), and verify the manifest grants zero permissions via `adb dumpsys`.
- **Prior art:** none (greenfield) — this milestone establishes the two test patterns named above.

## Out of Scope

- Any gameplay or feature UI: onboarding, pet creation, plan/purchases/savings/tasks/adult screens, demo mode (M2–M5).
- The economy engine, Clock port, content loader, and full schema (M1).
- Release signing with a real keystore and the docs pack beyond the README skeleton (M7).
- CI pipelines and cloud build services (explicitly avoided — offline, no-server constraint).
- Real pet art, final launcher icon, RuStore card assets (team/designer).
- Tablet/landscape, sounds, Помощник — all stretch tier (ROADMAP §2.6), gated behind M6.

## Further Notes

- Milestone AC (ROADMAP §7, M0), restated as the definition of done: release APK builds and installs on an Android 8.0 (API 26) emulator; portrait locked; cold launch → Main ≤5 s; `npm test` green.
- If the current stable Expo SDK's floor is already ≥ API 26, still pin 26 explicitly so a future SDK bump cannot silently raise or lower the floor.
- Launch-time budget is measured, not assumed: record the emulator stopwatch number in the M0 issue comments — M6 re-measures it as a regression gate.
- Use the canonical vocabulary from `CONTEXT.md` for any user-visible string introduced here («ФинПет», «монеты» if coins appear in the placeholder UI) and keep all strings in the strings module, never inline.
