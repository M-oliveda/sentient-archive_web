import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type { IClientConfig } from "@/types/config";
import { DEFAULT_FEATURE_FLAGS, DEFAULT_TOKEN_COSTS } from "@/types/config";

export const CLIENT_CONFIG_QUERY_KEY = ["client-config"] as const;

export async function fetchClientConfig(): Promise<IClientConfig> {
    const response = await apiRequest<IApiResponse<IClientConfig>>("/v1/config");
    return response.data;
}

/**
 * Fetch feature flags and token costs for the authenticated client.
 * Falls back to defaults while loading or on error so the UI stays usable.
 */
export function useClientConfig() {
    const { user } = useAuthStore();

    const query = useQuery({
        queryKey: CLIENT_CONFIG_QUERY_KEY,
        queryFn: fetchClientConfig,
        enabled: !!user?.uid,
        staleTime: 60_000,
    });

    const features = query.data?.features ?? DEFAULT_FEATURE_FLAGS;
    const tokenCosts = query.data?.tokens.costs ?? DEFAULT_TOKEN_COSTS;

    return {
        ...query,
        features,
        tokenCosts,
    };
}
