import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { apiRequest } from "@/lib/api-client";

jest.mock("@/lib/api-client");

const mockSetUser = jest.fn();
const mockInvalidateQueries = jest.fn();

jest.mock("@/stores/authStore", () => ({
    useAuthStore: () => ({
        user: {
            uid: "user-1",
            email: "jane@example.com",
            displayName: "Old",
            photoURL: null,
            role: "client",
            isActive: true,
            tokenBalance: 10,
        },
        setUser: mockSetUser,
    }),
}));

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

describe("useUpdateProfile", () => {
    it("calls PUT /v1/users/me and updates auth store", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                uid: "user-1",
                email: "jane@example.com",
                displayName: "Jane Doe",
                photoURL: null,
                role: "client",
                isActive: true,
                tokenBalance: 10,
            },
        });

        const { result } = renderHook(() => useUpdateProfile(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ displayName: "Jane Doe" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/users/me", {
            method: "PUT",
            body: JSON.stringify({ displayName: "Jane Doe" }),
        });
        expect(mockSetUser).toHaveBeenCalledWith(
            expect.objectContaining({ displayName: "Jane Doe" }),
        );
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["activity"],
        });
    });

    it("skips auth store update when response has no data", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: undefined,
        });

        const { result } = renderHook(() => useUpdateProfile(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ displayName: "Jane Doe" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["activity"],
        });
    });
});
