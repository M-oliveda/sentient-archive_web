/**
 * English (United Kingdom) flag SVG
 */

import type { IFlagProps } from "./types";

export function EnglishFlag({
    className,
    title = "English",
}: IFlagProps): React.JSX.Element {
    return (
        <svg
            viewBox="0 0 60 40"
            className={className}
            role="img"
            aria-label={title}
            xmlns="http://www.w3.org/2000/svg"
        >
            <title>{title}</title>
            <rect width="60" height="40" fill="#012169" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#fff" strokeWidth="8" />
            <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="5" />
            <path d="M30 0 V40 M0 20 H60" stroke="#fff" strokeWidth="13" />
            <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="8" />
        </svg>
    );
}
