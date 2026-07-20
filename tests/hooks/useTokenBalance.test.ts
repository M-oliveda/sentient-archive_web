import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useAuthStore } from "@/stores/authStore";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");
jest.mock("@/stores/authStore");

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
    };
}

const mockSetTokenBalance = jest.fn();

describe("useTokenBalance", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches live balance and syncs it to the auth store", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
            setTokenBalance: mockSetTokenBalance,
        });
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: { balance: 150, totalGranted: 200, totalSpent: 50 },
            timestamp: "2024-01-01T00:00:00Z",
        });

        const { result } = renderHook(() => useTokenBalance(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(apiRequest).toHaveBeenCalledWith("/v1/tokens/balance");
        expect(result.current.data).toEqual({
            balance: 150,
            totalGranted: 200,
            totalSpent: 50,
        });
        expect(mockSetTokenBalance).toHaveBeenCalledWith(150);
    });

    it("is disabled and makes no request when user is not authenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: null,
            setTokenBalance: mockSetTokenBalance,
        });

        const { result } = renderHook(() => useTokenBalance(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeUndefined();
        expect(apiRequest).not.toHaveBeenCalled();
    });

    it("does not sync to store when the API request fails", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
            setTokenBalance: mockSetTokenBalance,
        });
        (apiRequest as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useTokenBalance(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isError).toBe(true));

        expect(result.current.error).toBeInstanceOf(Error);
        expect(mockSetTokenBalance).not.toHaveBeenCalled();
    });
});
