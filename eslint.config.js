/**
 * Expo's flat config plus the FinPet architecture boundary:
 * src/core stays pure domain logic — no React/Expo, no ui/data imports
 * (ROADMAP §3; spec .scratch/m0-scaffold).
 */
const globals = require("globals");
const expoFlat = require("eslint-config-expo/flat");

const CORE_BANNED_PACKAGES = [
  "react",
  "react-native",
  "react-native-*",
  "expo",
  "expo-*",
  "@expo/*",
  "@react-navigation/*",
  "drizzle-orm",
];

module.exports = [
  {
    ignores: ["node_modules/", "android/", "ios/", "assets/", "scripts/"],
  },
  {
    files: ["jest.setup.js"],
    languageOptions: {
      globals: globals.jest,
    },
  },
  ...expoFlat,
  {
    settings: {
      "import/resolver": {
        node: { extensions: [".js", ".jsx", ".ts", ".tsx"] },
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            { target: "./src/core", from: "./src/ui" },
            { target: "./src/core", from: "./src/data" },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/**/__tests__/**", "src/**/*.test.ts", "src/**/*.node.test.ts"],
    rules: {
      "no-restricted-globals": [
        "error",
        {
          name: "crypto",
          message:
            "React Native does not guarantee a global crypto object. Use createLocalId from src/data/localId.",
        },
      ],
    },
  },
  {
    files: ["src/core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: CORE_BANNED_PACKAGES.map((pattern) => ({
            group: [pattern],
            message:
              "src/core is pure domain logic (ROADMAP §3): no React/Expo/storage imports here.",
          })),
        },
      ],
    },
  },
];
