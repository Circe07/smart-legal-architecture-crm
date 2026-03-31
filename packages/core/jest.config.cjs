module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  moduleNameMapper: {
    "^@archi-legal/db$": "<rootDir>/../db/src"
  },
  setupFiles: ["<rootDir>/src/tests/setup.ts"]
};
