import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
    useTokenRequests,
    useApproveTokenRequest,
    useRejectTokenRequest,
} from "@/hooks/useTokenRequests";
import * as apiClient from "@/lib/api-client";
import type { IApiResponse } from "@/types/api";
import type { ITokenRequest } from "@/types/admin";
import type { TokenRequestsResponse } from "@/hooks/useTokenRequests";

jest.mock("@/lib/api-client");

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

describe("useTokenRequests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches token requests and unwraps ApiResponse data", async () => {
        const mockData: TokenRequestsResponse = {
            requests: [
                {
                    id: "req1",
                    userId: "user1",
                    amount: 100,
                    status: "pending",
                    createdAt: "2026-07-22T00:00:00Z",
                    userEmail: "user@example.com",
                    userName: "Test User",
                },
            ],
            total: 1,
            limit: 20,
            offset: 0,
        };

        mockApiRequest.mockResolvedValue(wrapApiResponse(mockData));

        const { result } = renderHook(() => useTokenRequests(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(result.current.data?.requests).toHaveLength(1);
        expect(result.current.data?.requests[0]?.userName).toBe("Test User");
    });

    it("fetches with status filter", async () => {
        mockApiRequest.mockResolvedValue(
            wrapApiResponse({
                requests: [],
                total: 0,
                limit: 20,
                offset: 0,
            }),
        );

        const { result } = renderHook(() => useTokenRequests({ status: "pending" }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("status=pending"),
        );
    });

    it("fetches with pagination, userId, and date range filters", async () => {
        mockApiRequest.mockResolvedValue(
            wrapApiResponse({
                requests: [],
                total: 0,
                limit: 10,
                offset: 20,
            }),
        );

        const { result } = renderHook(
            () =>
                useTokenRequests({
                    limit: 10,
                    offset: 20,
                    userId: "user1",
                    startDate: "2026-07-01",
                    endDate: "2026-07-31",
                }),
            { wrapper: createWrapper() },
        );

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("limit=10"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("offset=20"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("userId=user1"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("startDate=2026-07-01"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("endDate=2026-07-31"),
        );
    });
});

describe("useApproveTokenRequest", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("approves token request successfully and unwraps data", async () => {
        const approvedRequest: ITokenRequest = {
            id: "req1",
            userId: "user1",
            amount: 100,
            status: "approved",
            createdAt: "2026-07-22T00:00:00Z",
            reviewedAt: "2026-07-22T12:00:00Z",
            reviewedBy: "admin1",
        };

        mockApiRequest.mockResolvedValue(wrapApiResponse(approvedRequest));

        const { result } = renderHook(() => useApproveTokenRequest(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            requestId: "req1",
            payload: { notes: "Approved" },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(approvedRequest);
        expect(mockApiRequest).toHaveBeenCalledWith(
            "/v1/admin/token-requests/req1/approve",
            {
                method: "POST",
                body: JSON.stringify({ notes: "Approved" }),
            },
        );
    });

    it("approves with amount override", async () => {
        const approvedRequest: ITokenRequest = {
            id: "req1",
            userId: "user1",
            amount: 150,
            status: "approved",
            createdAt: "2026-07-22T00:00:00Z",
        };

        mockApiRequest.mockResolvedValue(wrapApiResponse(approvedRequest));

        const { result } = renderHook(() => useApproveTokenRequest(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            requestId: "req1",
            payload: { amount: 150, notes: "Override amount" },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockApiRequest).toHaveBeenCalledWith(
            "/v1/admin/token-requests/req1/approve",
            {
                method: "POST",
                body: JSON.stringify({ amount: 150, notes: "Override amount" }),
            },
        );
    });
});

describe("useRejectTokenRequest", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("rejects token request successfully and unwraps data", async () => {
        const rejectedRequest: ITokenRequest = {
            id: "req1",
            userId: "user1",
            amount: 100,
            status: "rejected",
            createdAt: "2026-07-22T00:00:00Z",
            reviewedAt: "2026-07-22T12:00:00Z",
            reviewedBy: "admin1",
        };

        mockApiRequest.mockResolvedValue(wrapApiResponse(rejectedRequest));

        const { result } = renderHook(() => useRejectTokenRequest(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            requestId: "req1",
            payload: { reason: "Insufficient justification" },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(rejectedRequest);
        expect(mockApiRequest).toHaveBeenCalledWith(
            "/v1/admin/token-requests/req1/reject",
            {
                method: "POST",
                body: JSON.stringify({ reason: "Insufficient justification" }),
            },
        );
    });

    it("rejects without reason", async () => {
        const rejectedRequest: ITokenRequest = {
            id: "req1",
            userId: "user1",
            amount: 100,
            status: "rejected",
            createdAt: "2026-07-22T00:00:00Z",
        };

        mockApiRequest.mockResolvedValue(wrapApiResponse(rejectedRequest));

        const { result } = renderHook(() => useRejectTokenRequest(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            requestId: "req1",
            payload: {},
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockApiRequest).toHaveBeenCalledWith(
            "/v1/admin/token-requests/req1/reject",
            {
                method: "POST",
                body: JSON.stringify({}),
            },
        );
    });
});
