import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { IAdminStatsResponse } from "@/types/admin";

export async function fetchAdminStats(): Promise<IAdminStatsResponse> {
    const response =
        await apiRequest<IApiResponse<IAdminStatsResponse>>("/v1/admin/stats");
    return response.data;
}

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin", "stats"],
        queryFn: fetchAdminStats,
    });
}
