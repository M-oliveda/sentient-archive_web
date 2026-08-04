/**
 * useLanguage Hook
 *
 * Provides language management functionality
 */

import { useTranslation } from "react-i18next";
import {
    SUPPORTED_LANGUAGES,
    LANGUAGE_NAMES,
    type SupportedLanguage,
} from "@/lib/i18n";

export interface ILanguageOption {
    code: SupportedLanguage;
    name: string;
}

export function useLanguage() {
    const { i18n } = useTranslation();

    const currentLanguage = i18n.language as SupportedLanguage;

    const supportedLanguages: ILanguageOption[] = SUPPORTED_LANGUAGES.map((code) => ({
        code,
        name: LANGUAGE_NAMES[code],
    }));

    const changeLanguage = async (code: SupportedLanguage) => {
        await i18n.changeLanguage(code);
    };

    return {
        currentLanguage,
        supportedLanguages,
        changeLanguage,
    };
}
