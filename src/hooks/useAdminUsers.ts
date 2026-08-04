import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { IAdminUser } from "@/types/admin";

export interface AdminUsersResponse {
    users: IAdminUser[];
    total: number;
    limit: number;
    offset: number;
}

export interface AdminUsersQueryParams {
    limit?: number;
    offset?: number;
    role?: "client" | "admin";
    isActive?: boolean;
    search?: string;
    sortBy?: "createdAt" | "lastLoginAt" | "tokenBalance";
    sortOrder?: "asc" | "desc";
}

/**
 * Fetch admin users list with filtering and pagination
 */
export function useAdminUsers(params?: AdminUsersQueryParams) {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset !== undefined)
        queryParams.append("offset", params.offset.toString());
    if (params?.role) queryParams.append("role", params.role);
    if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    return useQuery({
        queryKey: ["admin-users", params],
        queryFn: async () => {
            const response = await apiRequest<IApiResponse<AdminUsersResponse>>(
                `/v1/admin/users?${queryParams.toString()}`,
            );
            return response.data;
        },
    });
}

export interface UpdateUserPayload {
    role?: "client" | "admin";
    isActive?: boolean;
    tokenBalance?: number;
}

/**
 * Update a user (admin operation)
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            userId,
            updates,
        }: {
            userId: string;
            updates: UpdateUserPayload;
        }) => {
            const response = await apiRequest<IApiResponse<IAdminUser>>(
                `/v1/admin/users/${userId}`,
                {
                    method: "PUT",
                    body: JSON.stringify(updates),
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
    });
}

export interface GrantTokensPayload {
    userId: string;
    amount: number;
    reason: string;
}

/**
 * Grant tokens to a user (admin operation)
 */
export function useGrantTokens() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (payload: GrantTokensPayload) => {
            const response = await apiRequest<IApiResponse<unknown>>(
                `/v1/tokens/mint`,
                {
                    method: "POST",
                    body: JSON.stringify(payload),
                },
            );
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-users"] });
        },
    });
}
