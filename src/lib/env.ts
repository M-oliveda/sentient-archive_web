// Environment configuration abstraction for testability
// This module abstracts import.meta.env access to make it mockable in tests

export const env = {
    get VITE_USE_EMULATOR(): string {
        return import.meta.env.VITE_USE_EMULATOR || "false";
    },
    get VITE_FIREBASE_API_KEY(): string {
        return import.meta.env.VITE_FIREBASE_API_KEY || "";
    },
    get VITE_FIREBASE_AUTH_DOMAIN(): string {
        return import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "";
    },
    get VITE_FIREBASE_PROJECT_ID(): string {
        return import.meta.env.VITE_FIREBASE_PROJECT_ID || "";
    },
    get VITE_FIREBASE_MESSAGING_SENDER_ID(): string {
        return import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "";
    },
    get VITE_FIREBASE_APP_ID(): string {
        return import.meta.env.VITE_FIREBASE_APP_ID || "";
    },
    get VITE_API_PROJECT_ID(): string {
        return import.meta.env.VITE_API_PROJECT_ID || "";
    },
    get VITE_API_BASE_URL(): string {
        return import.meta.env.VITE_API_BASE_URL || "";
    },
    get VITE_APP_URL(): string {
        return import.meta.env.VITE_APP_URL || "";
    },
};

export const isEmulatorEnabled = (): boolean => env.VITE_USE_EMULATOR === "true";
