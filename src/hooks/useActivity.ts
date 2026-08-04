import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type {
    ActivityFilterCategory,
    IActivityEntry,
    IActivityStats,
} from "@/types/activity";

interface IUseActivityFeedOptions {
    category: ActivityFilterCategory;
    q: string;
}

async function fetchActivityFeed(
    category: ActivityFilterCategory,
    q: string,
): Promise<IActivityEntry[]> {
    const params = new URLSearchParams();
    params.set("category", category);
    if (q.trim()) {
        params.set("q", q.trim());
    }
    params.set("limit", "50");

    const response = await apiRequest<IApiResponse<IActivityEntry[]>>(
        `/v1/activity?${params.toString()}`,
    );
    return response.data;
}

async function fetchActivityStats(): Promise<IActivityStats> {
    const response =
        await apiRequest<IApiResponse<IActivityStats>>("/v1/activity/stats");
    return response.data;
}

export function useActivityFeed({ category, q }: IUseActivityFeedOptions) {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["activity", "feed", user?.uid, category, q],
        queryFn: () => fetchActivityFeed(category, q),
        enabled: !!user?.uid,
    });
}

export function useActivityStats() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["activity", "stats", user?.uid],
        queryFn: fetchActivityStats,
        enabled: !!user?.uid,
    });
}
