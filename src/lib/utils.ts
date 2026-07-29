import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import i18n from "@/lib/i18n";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return i18n.t("timeAgo.seconds", { ns: "common", count: seconds });
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return i18n.t("timeAgo.minutes", { ns: "common", count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return i18n.t("timeAgo.hours", { ns: "common", count: hours });
    const days = Math.floor(hours / 24);
    return i18n.t("timeAgo.days", { ns: "common", count: days });
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
        return i18n.t("tokens.unitCompact", { ns: "common", amount: compact });
    }
    return i18n.t("tokens.unit", { ns: "common", amount });
}
