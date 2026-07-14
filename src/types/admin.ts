export type ServiceStatus = "Operational" | "Degraded" | "Down" | "In Danger";

export interface ISystemHealth {
    service: string;
    status: ServiceStatus;
}

export interface IActivityEntry {
    id: string;
    name: string;
    action: string;
    timeAgo: string;
}

export interface IAdminStats {
    totalUsers: number;
    totalNotes: number;
    totalTokens: number;
    totalAIOperations: number;
    systemHealth: ISystemHealth[];
    recentActivity: IActivityEntry[];
}

export interface IAdminStatsResponse {
    success: boolean;
    data: IAdminStats;
}
