/**
 * Spanish flag SVG
 */

import type { IFlagProps } from "./types";

export function SpanishFlag({
    className,
    title = "Español",
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
            <rect width="60" height="40" fill="#AA151B" />
            <rect y="10" width="60" height="20" fill="#F1BF00" />
        </svg>
    );
}
