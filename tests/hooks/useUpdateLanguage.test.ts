import { renderHook, waitFor } from "@testing-library/react";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useUpdateLanguage } from "@/hooks/useUpdateLanguage";
import { apiRequest } from "@/lib/api-client";
import type { User } from "@/types/user";

jest.mock("@/lib/api-client");

const mockSetUser = jest.fn();
const mockInvalidateQueries = jest.fn();

const mockUser: User = {
    uid: "user-1",
    email: "jane@example.com",
    displayName: "Jane",
    photoURL: null,
    role: "client",
    isActive: true,
    tokenBalance: 10,
    preferences: {
        language: "en",
        theme: "light",
        notificationsEnabled: true,
    },
};

let mockAuthUser: User | null = mockUser;

jest.mock("@/stores/authStore", () => ({
    useAuthStore: () => ({
        get user() {
            return mockAuthUser;
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
    mockAuthUser = mockUser;
});

describe("useUpdateLanguage", () => {
    it("calls PUT /v1/users/me and updates auth store preferences", async () => {
        const preferences = {
            language: "es" as const,
            theme: "light" as const,
            notificationsEnabled: true,
        };

        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                ...mockUser,
                preferences,
            },
        });

        const { result } = renderHook(() => useUpdateLanguage(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ language: "es" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(apiRequest).toHaveBeenCalledWith("/v1/users/me", {
            method: "PUT",
            body: JSON.stringify({ language: "es" }),
        });
        expect(mockSetUser).toHaveBeenCalledWith({
            ...mockUser,
            preferences,
        });
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["activity"],
        });
    });

    it("skips auth store update when response has no preferences", async () => {
        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                ...mockUser,
                preferences: undefined,
            },
        });

        const { result } = renderHook(() => useUpdateLanguage(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ language: "fr" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["activity"],
        });
    });

    it("skips auth store update when user is null", async () => {
        mockAuthUser = null;

        (apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: {
                ...mockUser,
                preferences: {
                    language: "pt",
                    theme: "dark",
                    notificationsEnabled: false,
                },
            },
        });

        const { result } = renderHook(() => useUpdateLanguage(), {
            wrapper: createWrapper(),
        });

        result.current.mutate({ language: "pt" });

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(mockSetUser).not.toHaveBeenCalled();
        expect(mockInvalidateQueries).toHaveBeenCalledWith({
            queryKey: ["activity"],
        });
    });
});
