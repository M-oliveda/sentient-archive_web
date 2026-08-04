import eslint from "@eslint/js";
import { defineConfig } from "eslint/config";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default defineConfig([
    // Base ESLint recommended rules
    eslint.configs.recommended,

    // TypeScript ESLint recommended rules
    ...tseslint.configs.recommended,

    // Prettier config (disables conflicting rules)
    prettierConfig,
    eslintPluginPrettierRecommended,

    // TypeScript + React configuration
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.es2022,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
        },
        settings: {
            react: {
                version: "detect",
            },
        },
        rules: {
            // React rules
            ...react.configs.recommended.rules,
            ...react.configs["jsx-runtime"].rules,
            ...reactHooks.configs.recommended.rules,
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "react/prop-types": "off",

            // TypeScript rules
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/consistent-type-imports": [
                "error",
                { prefer: "type-imports" },
            ],
            "@typescript-eslint/no-explicit-any": "warn",

            // General code quality
            "no-console": ["warn", { allow: ["warn", "error"] }],
            "prefer-const": "error",
            "no-var": "error",
            eqeqeq: ["error", "always"],
        },
    },

    // JavaScript files configuration
    {
        files: ["**/*.{js,cjs,mjs}"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                ...globals.node,
                ...globals.es2022,
            },
        },
    },

    // Playwright fixtures use a `use` callback that is not a React Hook
    {
        files: ["e2e/**/*.{ts,tsx}", "playwright.config.ts"],
        rules: {
            "react-hooks/rules-of-hooks": "off",
            "react-refresh/only-export-components": "off",
        },
    },

    // Ignore patterns
    {
        ignores: [
            "node_modules/**",
            "dist/**",
            "coverage/**",
            "playwright-report/**",
            "test-results/**",
            "*.config.js",
            "*.config.cjs",
            ".husky/**",
        ],
    },
]);
