import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IAdminStatsResponse } from "@/types/admin";

export async function fetchAdminStats(): Promise<IAdminStatsResponse> {
    return apiRequest<IAdminStatsResponse>("/v1/admin/stats");
}

export function useAdminStats() {
    return useQuery({
        queryKey: ["admin", "stats"],
        queryFn: fetchAdminStats,
    });
}
