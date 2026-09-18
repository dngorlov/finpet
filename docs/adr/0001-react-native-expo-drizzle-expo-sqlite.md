# React Native + Expo + Drizzle ORM + expo-sqlite for an Android-only app

## Status

accepted

## Context & decision

The hackathon doc targets Android 8.0+ only and lets the team choose between native Kotlin and cross-platform, judged on stability and reproducibility. Despite the single-platform target we build with **React Native (Expo managed workflow) + TypeScript, with Drizzle ORM over expo-sqlite** for local storage, because the team has a React Native developer and no Android-native or Flutter capacity. Stability/reproducibility are preserved via Expo prebuild, Hermes, and a plain `expo run:android` release build.

## Considered options

- **Kotlin + Jetpack Compose** (my default recommendation): rejected — no Kotlin capacity in the team within 11 days.
- **Flutter**: rejected — no Flutter capacity.
- **Native Android Views**: rejected for the same reason as Compose.

## Consequences

- `minSdkVersion` is pinned to 26 (Android 8.0) via `expo-build-properties`; the app uses zero native permissions.
- Cold-start on low-end devices is the main risk against the ≤5 s launch budget — mitigate with Hermes, lazy screens, and no startup network calls (there are none by design).
- All time-dependent logic must go through an injectable clock (see ADR-0002) and all educational content must stay in JSON assets, never in component code.
