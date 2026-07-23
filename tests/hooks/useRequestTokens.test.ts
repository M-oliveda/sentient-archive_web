import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRequestTokens } from "@/hooks/useRequestTokens";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");

const mockInvalidateQueries = jest.fn();

jest.mock("@tanstack/react-query", () => {
    const actual = jest.requireActual("@tanstack/react-query") as Record<
        string,
        unknown
    >;
    return {
        ...actual,
        useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
    };
});

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

describe("useRequestTokens", () => {
    it("calls POST /v1/tokens/request with the amount and justification payload", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: { requestId: "req-1", message: "Request submitted" },
        });

        const { result } = renderHook(() => useRequestTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            amount: 500,
            justification: "Need tokens for embeddings",
        });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/tokens/request", {
            method: "POST",
            body: JSON.stringify({
                amount: 500,
                justification: "Need tokens for embeddings",
            }),
        });
    });

    it("invalidates ['tokens', 'transactions'] query on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: { requestId: "req-1", message: "ok" },
        });

        const { result } = renderHook(() => useRequestTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ amount: 100 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["tokens", "transactions"],
        });
    });

    it("invalidates ['tokens', 'requests'] query on success", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: { requestId: "req-1", message: "ok" },
        });

        const { result } = renderHook(() => useRequestTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ amount: 100 });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["tokens", "requests"],
        });
    });

    it("enters error state when the API call fails", async () => {
        (apiRequest as jest.Mock).mockRejectedValue(new Error("Network error"));

        const { result } = renderHook(() => useRequestTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ amount: 200 });

        await waitFor(() => expect(result.current.isError).toBe(true));
    });
});
