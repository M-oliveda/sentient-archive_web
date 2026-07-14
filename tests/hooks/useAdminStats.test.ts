import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchAdminStats, useAdminStats } from "@/hooks/useAdminStats";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");

const mockResponse = {
    success: true,
    data: {
        totalUsers: 100,
        totalNotes: 50,
        totalTokens: 5000,
        totalAIOperations: 200,
        systemHealth: [{ service: "Core API", status: "Operational" }],
        recentActivity: [
            {
                id: "1",
                name: "Test User",
                action: "did something.",
                timeAgo: "1m ago",
            },
        ],
    },
};

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

describe("fetchAdminStats", () => {
    it("calls apiRequest with the admin stats endpoint and returns the response", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const result = await fetchAdminStats();

        expect(apiRequest).toHaveBeenCalledWith("/v1/admin/stats");
        expect(result).toEqual(mockResponse);
    });
});

describe("useAdminStats", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches admin stats and returns data on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAdminStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual(mockResponse);
        expect(result.current.isError).toBe(false);
    });

    it("returns error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAdminStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isError).toBe(true);
        expect(result.current.data).toBeUndefined();
    });
});
