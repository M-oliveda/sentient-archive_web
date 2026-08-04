/**
 * LanguageFlag Component Tests
 */

import { render, screen } from "@testing-library/react";
import {
    EnglishFlag,
    FrenchFlag,
    LanguageFlag,
    PortugueseFlag,
    SpanishFlag,
} from "@/components/layout/flags";
import type { SupportedLanguage } from "@/lib/i18n";

describe("Language flag components", () => {
    test.each([
        ["EnglishFlag", EnglishFlag, "English"],
        ["SpanishFlag", SpanishFlag, "Español"],
        ["FrenchFlag", FrenchFlag, "Français"],
        ["PortugueseFlag", PortugueseFlag, "Português"],
    ] as const)("%s renders an accessible SVG", (_name, Flag, title) => {
        render(<Flag />);
        const flag = screen.getByRole("img", { name: title });
        expect(flag).toBeInTheDocument();
        expect(flag.tagName.toLowerCase()).toBe("svg");
    });
});

describe("LanguageFlag", () => {
    test.each([
        ["en", "English"],
        ["es", "Español"],
        ["fr", "Français"],
        ["pt", "Português"],
    ] as const)("renders %s flag for language code", (language, title) => {
        render(<LanguageFlag language={language as SupportedLanguage} />);
        expect(screen.getByRole("img", { name: title })).toBeInTheDocument();
    });

    test("accepts a custom title", () => {
        render(<LanguageFlag language="es" title="Spanish" />);
        expect(screen.getByRole("img", { name: "Spanish" })).toBeInTheDocument();
    });

    test("falls back to English flag and title for unknown languages", () => {
        render(<LanguageFlag language={"xx" as SupportedLanguage} />);
        expect(screen.getByRole("img", { name: "English" })).toBeInTheDocument();
    });
});
