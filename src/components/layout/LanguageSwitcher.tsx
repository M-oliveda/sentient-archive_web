/**
 * LanguageSwitcher Component
 *
 * Dropdown menu for selecting the application language
 */

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LanguageFlag } from "@/components/layout/flags";
import { useLanguage } from "@/hooks/useLanguage";
import { useUpdateLanguage } from "@/hooks/useUpdateLanguage";
import { useAuthStore } from "@/stores/authStore";
import {
    LANGUAGE_NAMES,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/lib/i18n";

function resolveLanguage(language: string): SupportedLanguage {
    const base = language.split("-")[0] as SupportedLanguage;
    return SUPPORTED_LANGUAGES.includes(base) ? base : "en";
}

export function LanguageSwitcher() {
    const { currentLanguage, supportedLanguages, changeLanguage } = useLanguage();
    const { mutate: updateLanguage } = useUpdateLanguage();
    const { isAuthenticated } = useAuthStore();

    const selectedLanguage = resolveLanguage(currentLanguage);

    const handleLanguageChange = async (code: SupportedLanguage) => {
        // Update i18n and localStorage immediately
        await changeLanguage(code);

        // If user is authenticated, also persist to backend
        if (isAuthenticated) {
            updateLanguage({ language: code });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 px-2"
                        aria-label="Select language"
                    />
                }
            >
                <Languages className="size-5" />
                <LanguageFlag
                    language={selectedLanguage}
                    className="h-3.5 w-5.25 overflow-hidden rounded-sm"
                    title={LANGUAGE_NAMES[selectedLanguage]}
                />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {supportedLanguages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className={
                            selectedLanguage === lang.code
                                ? "bg-accent font-medium"
                                : ""
                        }
                    >
                        {lang.name}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
