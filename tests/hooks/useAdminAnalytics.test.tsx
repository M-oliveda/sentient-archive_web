import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchAdminAnalytics, useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { apiRequest } from "@/lib/api-client";
import type { IAdminAnalytics } from "@/types/admin";
import type { IApiResponse } from "@/types/api";

jest.mock("@/lib/api-client");

const mockAnalytics: IAdminAnalytics = {
    users: {
        total: 100,
        active: 80,
        inactive: 20,
        admins: 5,
        clients: 95,
    },
    notes: { total: 500 },
    tokens: { totalGranted: 3500, totalSpent: 1000, netBalance: 2500 },
    aiOperations: {
        total: 200,
        byType: {
            summarize: 50,
            autoTag: 40,
            flashcards: 60,
            ragQuery: 50,
        },
    },
};

const mockResponse: IApiResponse<IAdminAnalytics> = {
    success: true,
    data: mockAnalytics,
    timestamp: "2026-07-22T00:00:00.000Z",
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

describe("fetchAdminAnalytics", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls apiRequest with trends endpoint and unwraps ApiResponse data", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const result = await fetchAdminAnalytics("30d");

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/admin/analytics/trends?dateRange=30d",
        );
        expect(result).toEqual(mockAnalytics);
    });

    it("defaults to 30d date range when not specified", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const result = await fetchAdminAnalytics();

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/admin/analytics/trends?dateRange=30d",
        );
        expect(result).toEqual(mockAnalytics);
    });
});

describe("useAdminAnalytics", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches admin analytics and returns unwrapped data", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAdminAnalytics("30d"), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual(mockAnalytics);
        expect(result.current.isError).toBe(false);
    });

    it("returns error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAdminAnalytics(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isError).toBe(true);
        expect(result.current.data).toBeUndefined();
    });
});
