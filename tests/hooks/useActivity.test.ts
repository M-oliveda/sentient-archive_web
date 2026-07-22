import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useActivityFeed, useActivityStats } from "@/hooks/useActivity";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");

jest.mock("@/stores/authStore", () => ({
    useAuthStore: () => ({
        user: { uid: "user-1" },
    }),
}));

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(
            QueryClientProvider,
            { client: queryClient },
            children,
        );
    };
}

beforeEach(() => {
    jest.clearAllMocks();
});

describe("useActivityFeed", () => {
    it("fetches activity feed with category and search", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: [
                {
                    id: "1",
                    category: "ai",
                    title: "AI Summary",
                    description: "Done",
                    createdAt: "2024-01-01T00:00:00.000Z",
                },
            ],
        });

        const { result } = renderHook(
            () => useActivityFeed({ category: "ai", q: "summary" }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith(
            expect.stringContaining("/v1/activity?"),
        );
        expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining("category=ai"));
        expect(apiRequest).toHaveBeenCalledWith(expect.stringContaining("q=summary"));
        expect(result.current.data).toHaveLength(1);
    });

    it("omits empty search query param", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: [],
        });

        const { result } = renderHook(
            () => useActivityFeed({ category: "all", q: "  " }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        const url = (apiRequest as jest.Mock).mock.calls[0][0] as string;
        expect(url).not.toContain("q=");
    });
});

describe("useActivityStats", () => {
    it("fetches activity stats", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                actionsToday: 1,
                actionsTodayDeltaPct: 0,
                aiOpsThisWeek: 1,
                aiOpsThisWeekDeltaPct: 0,
                totalActions: 1,
            },
        });

        const { result } = renderHook(() => useActivityStats(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/activity/stats");
        expect(result.current.data?.totalActions).toBe(1);
    });
});
