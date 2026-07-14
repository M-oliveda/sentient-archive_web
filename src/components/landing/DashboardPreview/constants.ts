export const SCREEN_IDS = ["dashboard", "notes", "editor", "ai"] as const;
export type ScreenId = (typeof SCREEN_IDS)[number];

export const CYCLE_MS = 3400;

export const ACTIVE_NAV: Record<ScreenId, number> = {
    dashboard: 0,
    notes: 1,
    editor: 1,
    ai: 2,
};

export const slideVariants = {
    enter: { x: 28, opacity: 0 },
    center: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.35, ease: "easeOut" },
    },
    exit: {
        x: -28,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeIn" },
    },
};
