export type ActivityCategory = "ai" | "tokens" | "notes" | "folders";

export type ActivityFilterCategory = "all" | ActivityCategory;

export type ActivityIconHint = "bot" | "coins" | "file-text" | "folder" | "pencil";

export interface IActivityEntry {
    id: string;
    category: ActivityCategory;
    title: string;
    description: string;
    createdAt: string;
    iconHint?: ActivityIconHint;
}

export interface IActivityStats {
    actionsToday: number;
    actionsTodayDeltaPct: number;
    aiOpsThisWeek: number;
    aiOpsThisWeekDeltaPct: number;
    totalActions: number;
}
