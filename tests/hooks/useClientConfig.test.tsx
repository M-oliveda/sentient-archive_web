import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fetchClientConfig, useClientConfig } from "@/hooks/useClientConfig";
import * as apiClient from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";
import { DEFAULT_FEATURE_FLAGS, DEFAULT_TOKEN_COSTS } from "@/types/config";

jest.mock("@/lib/api-client");
jest.mock("@/stores/authStore");

function createWrapper() {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });

    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        );
    }

    return Wrapper;
}

describe("fetchClientConfig", () => {
    it("unwraps the API response data", async () => {
        const payload = {
            features: DEFAULT_FEATURE_FLAGS,
            tokens: { costs: DEFAULT_TOKEN_COSTS },
        };
        (apiClient.apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: payload,
            timestamp: "2026-07-23T00:00:00Z",
        });

        const result = await fetchClientConfig();

        expect(apiClient.apiRequest).toHaveBeenCalledWith("/v1/config");
        expect(result).toEqual(payload);
    });
});

describe("useClientConfig", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (useAuthStore as unknown as jest.Mock).mockReturnValue({
            user: { uid: "user-1" },
        });
    });

    it("returns defaults while loading", () => {
        (apiClient.apiRequest as jest.Mock).mockReturnValue(new Promise(() => {}));

        const { result } = renderHook(() => useClientConfig(), {
            wrapper: createWrapper(),
        });

        expect(result.current.features).toEqual(DEFAULT_FEATURE_FLAGS);
        expect(result.current.tokenCosts).toEqual(DEFAULT_TOKEN_COSTS);
    });

    it("returns fetched features and costs", async () => {
        const features = {
            ...DEFAULT_FEATURE_FLAGS,
            flashcardsEnabled: false,
        };
        const costs = { ...DEFAULT_TOKEN_COSTS, flashcards: 12 };
        (apiClient.apiRequest as jest.Mock).mockResolvedValue({
            success: true,
            data: { features, tokens: { costs } },
            timestamp: "2026-07-23T00:00:00Z",
        });

        const { result } = renderHook(() => useClientConfig(), {
            wrapper: createWrapper(),
        });

        await waitFor(() => {
            expect(result.current.features.flashcardsEnabled).toBe(false);
        });
        expect(result.current.tokenCosts.flashcards).toBe(12);
    });

    it("does not fetch when user is unauthenticated", () => {
        (useAuthStore as unknown as jest.Mock).mockReturnValue({ user: null });

        renderHook(() => useClientConfig(), { wrapper: createWrapper() });

        expect(apiClient.apiRequest).not.toHaveBeenCalled();
    });
});
