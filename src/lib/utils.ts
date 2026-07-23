import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

/**
 * Format a raw token amount into a compact "TKN" display value,
 * e.g. 50000 -> "50k TKN", 250 -> "250 TKN".
 */
export function formatTokenAmount(amount: number): string {
    if (amount >= 1000) {
        const rounded = amount / 1000;
        const compact = Number.isInteger(rounded)
            ? rounded.toString()
            : rounded.toFixed(1);
        return `${compact}k TKN`;
    }
    return `${amount} TKN`;
}
