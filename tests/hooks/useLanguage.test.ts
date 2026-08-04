/**
 * useLanguage Hook Tests
 */

import { renderHook } from "@testing-library/react";
import { useLanguage } from "@/hooks/useLanguage";

describe("useLanguage", () => {
    test("returns current language", () => {
        const { result } = renderHook(() => useLanguage());
        expect(result.current.currentLanguage).toBe("en");
    });

    test("returns supported languages with names", () => {
        const { result } = renderHook(() => useLanguage());
        expect(result.current.supportedLanguages).toEqual([
            { code: "en", name: "English" },
            { code: "es", name: "Español" },
            { code: "fr", name: "Français" },
            { code: "pt", name: "Português" },
        ]);
    });

    test("provides changeLanguage function", () => {
        const { result } = renderHook(() => useLanguage());
        expect(typeof result.current.changeLanguage).toBe("function");
    });

    test("changeLanguage calls i18n.changeLanguage", async () => {
        const { result } = renderHook(() => useLanguage());
        await expect(result.current.changeLanguage("es")).resolves.toBeUndefined();
    });
});
