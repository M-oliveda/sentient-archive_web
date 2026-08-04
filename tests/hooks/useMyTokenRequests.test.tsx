import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMyTokenRequests } from "@/hooks/useMyTokenRequests";
import { useAuthStore } from "@/stores/authStore";
import * as apiClient from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { IMyTokenRequest } from "@/hooks/useMyTokenRequests";

jest.mock("@/lib/api-client");
jest.mock("@/stores/authStore");

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<
    typeof apiClient.apiRequest
>;

function wrapApiResponse<T>(data: T): IApiResponse<T> {
    return {
        success: true,
        data,
        timestamp: "2026-07-22T00:00:00Z",
    };
}

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
};

describe("useMyTokenRequests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
    });

    it("fetches the current user's token requests and unwraps data", async () => {
        const mockData: IMyTokenRequest[] = [
            {
                id: "req1",
                userId: "user-1",
                amount: 50,
                status: "pending",
                createdAt: "2026-07-22T00:00:00Z",
            },
        ];

        mockApiRequest.mockResolvedValue(wrapApiResponse(mockData));

        const { result } = renderHook(() => useMyTokenRequests(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockApiRequest).toHaveBeenCalledWith("/v1/tokens/requests");
        expect(result.current.data).toEqual(mockData);
        expect(result.current.data?.[0]?.status).toBe("pending");
    });

    it("does not fetch when user is not authenticated", async () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        const { result } = renderHook(() => useMyTokenRequests(), {
            wrapper: createWrapper(),
        });

        expect(result.current.fetchStatus).toBe("idle");
        expect(mockApiRequest).not.toHaveBeenCalled();
    });
});
