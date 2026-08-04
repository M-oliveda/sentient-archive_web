import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { IAdminAnalytics } from "@/types/admin";

export type AnalyticsDateRange = "7d" | "30d" | "90d";

/**
 * Fetch system-wide admin analytics with trends, unwrapping the ApiResponse envelope.
 */
export async function fetchAdminAnalytics(
    dateRange: AnalyticsDateRange = "30d",
): Promise<IAdminAnalytics> {
    const response = await apiRequest<IApiResponse<IAdminAnalytics>>(
        `/v1/admin/analytics/trends?dateRange=${dateRange}`,
    );
    return response.data;
}

export function useAdminAnalytics(dateRange: AnalyticsDateRange = "30d") {
    return useQuery({
        queryKey: ["admin-analytics", dateRange],
        queryFn: () => fetchAdminAnalytics(dateRange),
    });
}
