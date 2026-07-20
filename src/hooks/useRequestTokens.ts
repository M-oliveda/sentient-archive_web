import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";

export interface IRequestTokensPayload {
    amount: number;
}

export interface IRequestTokensData {
    requestId: string;
    message: string;
}

export function useRequestTokens() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: IRequestTokensPayload) =>
            apiRequest<IApiResponse<IRequestTokensData>>("/v1/tokens/request", {
                method: "POST",
                body: JSON.stringify(payload),
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tokens", "transactions"] });
            queryClient.invalidateQueries({ queryKey: ["tokens", "requests"] });
        },
    });
}
