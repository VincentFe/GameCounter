module.exports = {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleFileExtensions: ["ts", "js", "json", "node"],
  testMatch: ["**/?(*.)+(spec|test).[tj]s"],
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { useESM: true }],
  },
  moduleNameMapper: {
    "^((?:\\.\\./)+src/.*)\\.js$": "$1.ts",
    "^\\./(controllers|model)/(.+)\\.js$": "<rootDir>/src/$1/$2.ts",
    "^\\.\\./(controllers|model)/(.+)\\.js$": "<rootDir>/src/$1/$2.ts",
    "^\./gameManager\.js$": "<rootDir>/src/model/gameManager.ts",
    "^\./Player\.js$": "<rootDir>/src/model/Player.ts",
    "^\./Game\.js$": "<rootDir>/src/model/Game.ts",
    "^\./Group\.js$": "<rootDir>/src/model/Group.ts",
    "^\./User\.js$": "<rootDir>/src/model/User.ts",
  },
  globals: {
    "ts-jest": {
      useESM: true,
      tsconfig: {
        target: "ES2020",
        module: "ES2020",
        moduleResolution: "node",
        allowSyntheticDefaultImports: true,
      },
    },
  },
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
