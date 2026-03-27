import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testMatch: ["<rootDir>/tests/**/*.test.ts", "<rootDir>/tests/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/app/$1",
  },
  collectCoverageFrom: [
    "src/app/**/*.{ts,tsx}",
    "!src/app/**/*.d.ts",
    "!src/app/**/types/**",
  ],
};

export default createJestConfig(config);
