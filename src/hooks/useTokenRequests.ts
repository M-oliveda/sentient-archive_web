import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { ITokenRequest } from "@/types/admin";

export interface TokenRequestsResponse {
    requests: ITokenRequest[];
    total: number;
    limit: number;
    offset: number;
}

export interface TokenRequestsQueryParams {
    limit?: number;
    offset?: number;
    status?: "all" | "pending" | "approved" | "rejected";
    userId?: string;
    startDate?: string;
    endDate?: string;
}

/**
 * Fetch token requests for admin review, unwrapping the ApiResponse envelope.
 */
export function useTokenRequests(params?: TokenRequestsQueryParams) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset !== undefined)
        queryParams.append("offset", params.offset.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.userId) queryParams.append("userId", params.userId);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    return useQuery({
        queryKey: ["token-requests", params],
        queryFn: async () => {
            const response = await apiRequest<IApiResponse<TokenRequestsResponse>>(
                `/v1/admin/token-requests?${queryParams.toString()}`,
            );
            return response.data;
        },
    });
}

export interface ApproveTokenRequestPayload {
    amount?: number;
    notes?: string;
}

/**
 * Approve a token request
 */
export function useApproveTokenRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            requestId,
            payload,
        }: {
            requestId: string;
            payload: ApproveTokenRequestPayload;
        }) => {
            const response = await apiRequest<IApiResponse<ITokenRequest>>(
                `/v1/admin/token-requests/${requestId}/approve`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["token-requests"] });
            queryClient.invalidateQueries({ queryKey: ["tokens", "requests"] });
            queryClient.invalidateQueries({ queryKey: ["tokens", "balance"] });
        },
    });
}

export interface RejectTokenRequestPayload {
    reason?: string;
}

/**
 * Reject a token request
 */
export function useRejectTokenRequest() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            requestId,
            payload,
        }: {
            requestId: string;
            payload: RejectTokenRequestPayload;
        }) => {
            const response = await apiRequest<IApiResponse<ITokenRequest>>(
                `/v1/admin/token-requests/${requestId}/reject`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["token-requests"] });
            queryClient.invalidateQueries({ queryKey: ["tokens", "requests"] });
        },
    });
}
