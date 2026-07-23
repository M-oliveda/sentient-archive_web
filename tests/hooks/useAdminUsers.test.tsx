import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAdminUsers, useUpdateUser, useGrantTokens } from "@/hooks/useAdminUsers";
import * as apiClient from "@/lib/api-client";

jest.mock("@/lib/api-client");

const mockApiRequest = apiClient.apiRequest as jest.MockedFunction<
    typeof apiClient.apiRequest
>;

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

describe("useAdminUsers", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("fetches admin users and unwraps ApiResponse data", async () => {
        const mockData = {
            users: [
                {
                    uid: "user1",
                    email: "user@example.com",
                    displayName: "Test User",
                    role: "client" as const,
                    isActive: true,
                    tokenBalance: 100,
                },
            ],
            total: 1,
            limit: 20,
            offset: 0,
        };

        mockApiRequest.mockResolvedValue({
            success: true,
            data: mockData,
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const { result } = renderHook(() => useAdminUsers(), {
            wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.data).toEqual(mockData);
        expect(mockApiRequest).toHaveBeenCalledWith("/v1/admin/users?");
    });

    it("fetches with custom filters", async () => {
        mockApiRequest.mockResolvedValue({
            success: true,
            data: {
                users: [],
                total: 0,
                limit: 10,
                offset: 0,
            },
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const { result } = renderHook(
            () =>
                useAdminUsers({
                    limit: 10,
                    offset: 5,
                    role: "admin",
                    isActive: true,
                    search: "admin@example.com",
                    sortBy: "tokenBalance",
                    sortOrder: "asc",
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
            expect.stringContaining("offset=5"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("role=admin"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("isActive=true"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("search=admin%40example.com"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("sortBy=tokenBalance"),
        );
        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("sortOrder=asc"),
        );
    });

    it("appends isActive=false when filtering inactive users", async () => {
        mockApiRequest.mockResolvedValue({
            success: true,
            data: {
                users: [],
                total: 0,
                limit: 20,
                offset: 0,
            },
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const { result } = renderHook(() => useAdminUsers({ isActive: false }), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockApiRequest).toHaveBeenCalledWith(
            expect.stringContaining("isActive=false"),
        );
    });

    it("handles errors gracefully", async () => {
        const error = new Error("Failed to fetch users");
        mockApiRequest.mockRejectedValue(error);

        const { result } = renderHook(() => useAdminUsers(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.isError).toBe(true);
        expect(result.current.error).toBe(error);
    });
});

describe("useUpdateUser", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("updates user successfully and unwraps ApiResponse data", async () => {
        const updatedUser = {
            uid: "user1",
            email: "user@example.com",
            role: "admin" as const,
            isActive: true,
            tokenBalance: 150,
        };

        mockApiRequest.mockResolvedValue({
            success: true,
            data: updatedUser,
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const { result } = renderHook(() => useUpdateUser(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            userId: "user1",
            updates: { role: "admin", tokenBalance: 150 },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(result.current.data).toEqual(updatedUser);
    });

    it("invalidates queries on success", async () => {
        mockApiRequest.mockResolvedValue({
            success: true,
            data: {},
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const queryClient = new QueryClient();
        const invalidateSpy = jest.spyOn(queryClient, "invalidateQueries");

        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );

        const { result } = renderHook(() => useUpdateUser(), { wrapper });

        result.current.mutate({
            userId: "user1",
            updates: { isActive: false },
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(invalidateSpy).toHaveBeenCalledWith(
            expect.objectContaining({ queryKey: ["admin-users"] }),
        );
    });
});

describe("useGrantTokens", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("grants tokens successfully", async () => {
        const transaction = {
            id: "tx1",
            userId: "user1",
            type: "grant" as const,
            amount: 100,
            operation: "admin_grant" as const,
            balanceBefore: 50,
            balanceAfter: 150,
            createdAt: new Date().toISOString(),
            description: "Admin grant",
        };

        mockApiRequest.mockResolvedValue({
            success: true,
            data: transaction,
            timestamp: "2026-07-22T00:00:00.000Z",
        });

        const { result } = renderHook(() => useGrantTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            userId: "user1",
            amount: 100,
            reason: "Performance bonus",
        });

        await waitFor(() => {
            expect(result.current.isSuccess).toBe(true);
        });

        expect(mockApiRequest).toHaveBeenCalledWith("/v1/tokens/mint", {
            method: "POST",
            body: JSON.stringify({
                userId: "user1",
                amount: 100,
                reason: "Performance bonus",
            }),
        });
        expect(result.current.data).toEqual(transaction);
    });

    it("handles errors when granting tokens", async () => {
        const error = new Error("Insufficient permissions");
        mockApiRequest.mockRejectedValue(error);

        const { result } = renderHook(() => useGrantTokens(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({
            userId: "user1",
            amount: 100,
            reason: "Test grant",
        });

        await waitFor(() => {
            expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toBe(error);
    });
});
