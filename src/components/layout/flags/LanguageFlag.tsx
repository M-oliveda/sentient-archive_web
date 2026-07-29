/**
 * LanguageFlag Component
 *
 * Renders the flag SVG matching the given supported language
 */

import { LANGUAGE_NAMES, type SupportedLanguage } from "@/lib/i18n";
import { EnglishFlag } from "./EnglishFlag";
import { SpanishFlag } from "./SpanishFlag";
import { FrenchFlag } from "./FrenchFlag";
import { PortugueseFlag } from "./PortugueseFlag";
import type { IFlagProps } from "./types";

interface ILanguageFlagProps extends IFlagProps {
    language: SupportedLanguage;
}

const FLAG_BY_LANGUAGE: Record<
    SupportedLanguage,
    (props: IFlagProps) => React.JSX.Element
> = {
    en: EnglishFlag,
    es: SpanishFlag,
    fr: FrenchFlag,
    pt: PortugueseFlag,
};

export function LanguageFlag({
    language,
    className,
    title,
}: ILanguageFlagProps): React.JSX.Element {
    const Flag = FLAG_BY_LANGUAGE[language] ?? EnglishFlag;
    const flagTitle = title ?? LANGUAGE_NAMES[language] ?? LANGUAGE_NAMES.en;

    return <Flag className={className} title={flagTitle} />;
}
