# ФинПет (FinPet)

An offline Android game teaching kids 7–11 basic money skills through caring for a virtual pet. Hackathon prototype — milestone M0 (scaffold). All planning docs live in [`docs/`](./docs) (start with [`docs/ROADMAP.md`](./docs/ROADMAP.md)); domain vocabulary in [`CONTEXT.md`](./CONTEXT.md).

## App identity

| Field | Value |
|---|---|
| Display name | ФинПет |
| Package | `org.hseteamspb.finpet` |
| Version | 0.1.0 (versionCode 1) |
| Min Android | 8.0 (API 26), portrait-only |
| Permissions | none in release |

## Prerequisites

- Node LTS and npm
- JDK 17
- Android Studio SDK with an API 26+ emulator (for `ANDROID_HOME` and device runs)

## Everyday commands

```bash
npm install          # once
npm test             # jest suite (no device needed)
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npx expo start       # Metro dev server; press a for Android
```

## Build a release APK

```bash
npx expo run:android --variant release
# APK lands in android/app/build/outputs/apk/release/
```

Note: the release variant currently signs with the debug keystore; the real keystore + signing config arrive at milestone M7 (ROADMAP §7).

## Placeholder pet assets

`assets/pets/` is generated placeholder art matching the designer-drop contract (ROADMAP §5.4). Regenerate after changing the contract:

```bash
node scripts/gen-placeholder-pets.mjs
```

## Repository map

- `src/core/` — pure domain logic (no React/Expo imports; enforced by `npm run lint`)
- `src/data/` — expo-sqlite + Drizzle bootstrap, migrations, repositories (M1)
- `src/ui/` — screens, components, theme, RU strings
- `assets/content/` — educational content JSON (loader lands in M1)
- `docs/` — requirements, roadmap, ADRs
- `.scratch/` — local issue tracker (specs and tickets)
