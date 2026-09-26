module.exports = {
  projects: [
    {
      displayName: "app",
      preset: "jest-expo",
      transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-.*|@expo/.*|@react-navigation/.*|drizzle-orm|react-native-svg|@expo-google-fonts)/.*)",
      ],
      testPathIgnorePatterns: ["/node_modules/", "\\.node\\.test\\.(ts|tsx)$"],
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
    {
      displayName: "data",
      testEnvironment: "node",
      testMatch: ["<rootDir>/src/data/**/*.node.test.ts"],
      transform: {
        "^.+\\.tsx?$": [
          "babel-jest",
          {
            presets: ["@babel/preset-typescript"],
            plugins: ["@babel/plugin-transform-modules-commonjs"],
          },
        ],
      },
    },
  ],
};
