import Constants from "expo-constants";

/** Mirrors app.json at runtime; fallbacks only cover jest runs. */
export const APP_VERSION = Constants.expoConfig?.version ?? "0.1.0";
export const APP_BUILD = Constants.expoConfig?.android?.versionCode ?? 1;
