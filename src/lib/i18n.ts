/**
 * i18next Configuration
 *
 * Configures internationalization with support for English, Spanish, French, and Portuguese
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// List of supported languages
export const SUPPORTED_LANGUAGES = ["en", "es", "fr", "pt"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// Language display names (in their native language)
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
    en: "English",
    es: "Español",
    fr: "Français",
    pt: "Português",
};

// List of namespaces
const NAMESPACES = [
    "common",
    "auth",
    "layout",
    "dashboard",
    "notes",
    "ai",
    "tokens",
    "activity",
    "settings",
    "admin",
    "landing",
    "legal",
] as const;

void i18n
    .use(HttpBackend) // Load translations via HTTP
    .use(LanguageDetector) // Detect user language
    .use(initReactI18next) // Pass i18n instance to react-i18next
    .init({
        fallbackLng: "en",
        supportedLngs: SUPPORTED_LANGUAGES,
        defaultNS: "common",
        ns: NAMESPACES,

        // Language detection order
        detection: {
            order: ["localStorage", "navigator"],
            caches: ["localStorage"],
            lookupLocalStorage: "i18nextLng",
        },

        // HTTP backend configuration
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },

        // React-specific options
        react: {
            useSuspense: true,
        },

        // Interpolation options
        interpolation: {
            escapeValue: false, // React already escapes
        },

        // Load all namespaces on init for better UX
        load: "languageOnly", // Load 'en' instead of 'en-US'
    });

export default i18n;
