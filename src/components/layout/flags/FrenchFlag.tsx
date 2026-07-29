/**
 * French flag SVG
 */

import type { IFlagProps } from "./types";

export function FrenchFlag({
    className,
    title = "Français",
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
            <rect width="20" height="40" fill="#002395" />
            <rect x="20" width="20" height="40" fill="#fff" />
            <rect x="40" width="20" height="40" fill="#ED2939" />
        </svg>
    );
}
