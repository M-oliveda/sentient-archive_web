import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";
import type { TokenRequestStatus } from "@/types/transaction";

export interface IMyTokenRequest {
    id: string;
    userId: string;
    amount: number;
    status: TokenRequestStatus;
    createdAt: string;
    reviewedAt?: string;
    reviewedBy?: string;
    justification?: string;
    reason?: string;
}

/**
 * Fetch the current user's token requests (client-facing endpoint).
 */
export function useMyTokenRequests() {
    const { user } = useAuthStore();

    return useQuery({
        queryKey: ["tokens", "requests"],
        queryFn: async () => {
            const response =
                await apiRequest<IApiResponse<IMyTokenRequest[]>>(
                    "/v1/tokens/requests",
                );
            return response.data;
        },
        enabled: !!user?.uid,
    });
}
