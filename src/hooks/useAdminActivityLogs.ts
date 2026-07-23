import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { IAdminActivityEntry } from "@/types/admin";

export interface AdminActivityLogsQueryParams {
    limit?: number;
    offset?: number;
    category?: "all" | "ai" | "tokens" | "notes" | "folders";
    userId?: string;
    q?: string;
    startDate?: string;
    endDate?: string;
}

export interface AdminActivityLogsResponse {
    entries: IAdminActivityEntry[];
    total: number;
    limit: number;
    offset: number;
}

/**
 * Fetch system-wide admin activity logs
 */
export async function fetchAdminActivityLogs(
    params: AdminActivityLogsQueryParams = {},
): Promise<AdminActivityLogsResponse> {
    const queryParams = new URLSearchParams();

    if (params.limit) queryParams.append("limit", params.limit.toString());
    if (params.offset !== undefined)
        queryParams.append("offset", params.offset.toString());
    if (params.category) queryParams.append("category", params.category);
    if (params.userId) queryParams.append("userId", params.userId);
    if (params.q) queryParams.append("q", params.q);
    if (params.startDate) queryParams.append("startDate", params.startDate);
    if (params.endDate) queryParams.append("endDate", params.endDate);

    const response = await apiRequest<IApiResponse<AdminActivityLogsResponse>>(
        `/v1/admin/activity-logs?${queryParams.toString()}`,
    );
    return response.data;
}

/**
 * Hook to fetch system-wide activity logs (admin only)
 */
export function useAdminActivityLogs(params: AdminActivityLogsQueryParams = {}) {
    return useQuery({
        queryKey: ["admin-activity-logs", params],
        queryFn: () => fetchAdminActivityLogs(params),
    });
}
