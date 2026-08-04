/**
 * Portuguese flag SVG
 */

import type { IFlagProps } from "./types";

export function PortugueseFlag({
    className,
    title = "Português",
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
            <rect width="60" height="40" fill="#FF0000" />
            <rect width="24" height="40" fill="#006600" />
            <circle cx="24" cy="20" r="7.5" fill="#FFCC00" />
            <circle cx="24" cy="20" r="5" fill="#FF0000" />
            <rect x="21" y="16.5" width="6" height="7" rx="0.5" fill="#fff" />
        </svg>
    );
}
