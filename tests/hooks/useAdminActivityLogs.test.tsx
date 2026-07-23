import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    fetchAdminActivityLogs,
    useAdminActivityLogs,
} from "@/hooks/useAdminActivityLogs";
import { apiRequest } from "@/lib/api-client";
import type { IAdminActivityEntry } from "@/types/admin";
import type { IApiResponse } from "@/types/api";
import type { AdminActivityLogsResponse } from "@/hooks/useAdminActivityLogs";

jest.mock("@/lib/api-client");

const mockEntries: IAdminActivityEntry[] = [
    {
        id: "1",
        category: "ai",
        title: "Summarized a note",
        description: "Generated a summary",
        createdAt: "2026-07-22T12:00:00.000Z",
        iconHint: "bot",
        userId: "user-1",
        userEmail: "user@example.com",
        userName: "Test User",
    },
];

const mockData: AdminActivityLogsResponse = {
    entries: mockEntries,
    total: 1,
    limit: 50,
    offset: 0,
};

const mockResponse: IApiResponse<AdminActivityLogsResponse> = {
    success: true,
    data: mockData,
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

describe("fetchAdminActivityLogs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);
    });

    it("calls apiRequest with empty query when no params are provided", async () => {
        const result = await fetchAdminActivityLogs();

        expect(apiRequest).toHaveBeenCalledWith("/v1/admin/activity-logs?");
        expect(result).toEqual(mockData);
    });

    it("appends all provided query params including offset 0", async () => {
        await fetchAdminActivityLogs({
            limit: 25,
            offset: 0,
            category: "tokens",
            userId: "user-1",
            q: "summary",
            startDate: "2026-07-01",
            endDate: "2026-07-22",
        });

        expect(apiRequest).toHaveBeenCalledWith(
            "/v1/admin/activity-logs?limit=25&offset=0&category=tokens&userId=user-1&q=summary&startDate=2026-07-01&endDate=2026-07-22",
        );
    });

    it("omits falsy limit while keeping other params", async () => {
        await fetchAdminActivityLogs({
            limit: 0,
            category: "ai",
        });

        expect(apiRequest).toHaveBeenCalledWith("/v1/admin/activity-logs?category=ai");
    });
});

describe("useAdminActivityLogs", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches activity logs and returns unwrapped data", async () => {
        (apiRequest as jest.Mock).mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useAdminActivityLogs({ category: "all" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual(mockData);
        expect(result.current.isError).toBe(false);
    });

    it("returns error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("API error"));

        const { result } = renderHook(() => useAdminActivityLogs(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.isError).toBe(true);
        expect(result.current.data).toBeUndefined();
    });
});
