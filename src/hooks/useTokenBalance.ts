import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import type { IApiResponse } from "@/types/api";

export interface ITokenBalanceData {
    balance: number;
    totalGranted: number;
    totalSpent: number;
}

export function useTokenBalance() {
    const { user, setTokenBalance } = useAuthStore();

    return useQuery({
        queryKey: ["tokens", "balance"],
        queryFn: async () => {
            const response =
                await apiRequest<IApiResponse<ITokenBalanceData>>("/v1/tokens/balance");
            setTokenBalance(response.data.balance);
            return response.data;
        },
        enabled: !!user?.uid,
    });
}
