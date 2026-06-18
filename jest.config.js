/** @type {import('jest').Config} */
export default {
    testEnvironment: "jsdom",
    roots: ["<rootDir>/src", "<rootDir>/tests"],
    testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
    moduleNameMapper: {
        "^@/lib/env$": "<rootDir>/tests/__mocks__/env.ts",
        "^\\./env$": "<rootDir>/tests/__mocks__/env.ts",
        "^\\.\\./lib/env$": "<rootDir>/tests/__mocks__/env.ts",
        "^@/(.*)$": "<rootDir>/src/$1",
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
        "\\.(jpg|jpeg|png|gif|svg)$": "<rootDir>/tests/__mocks__/fileMock.js",
        "^lucide-react$": "<rootDir>/tests/__mocks__/lucide-react.ts",
        "^firebase/functions$": "<rootDir>/tests/__mocks__/firebase-functions.ts",
    },
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    collectCoverageFrom: [
        "src/**/*.{ts,tsx}",
        "!src/**/*.d.ts",
        "!src/main.tsx",
        "!src/vite-env.d.ts",
        "!src/lib/env.ts",
    ],
    coverageThreshold: {
        global: {
            branches: 100,
            functions: 100,
            lines: 100,
            statements: 100,
        },
    },
    transform: {
        "^.+\\.(ts|tsx)$": "babel-jest",
    },
    transformIgnorePatterns: ["node_modules/(?!(lucide-react|@tanstack|firebase)/)"],
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
