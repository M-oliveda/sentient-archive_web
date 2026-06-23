// Mock env module first
let mockIsEmulatorEnabled = false;
const mockEnv = {
    VITE_FIREBASE_PROJECT_ID: "test-project",
    VITE_API_PROJECT_ID: "",
};

jest.mock("@/lib/env", () => ({
    get env() {
        return mockEnv;
    },
    isEmulatorEnabled: () => mockIsEmulatorEnabled,
}));

// Mock firebase/auth
const mockGetIdToken = jest.fn();

jest.mock("firebase/auth", () => ({
    getAuth: jest.fn(() => ({
        currentUser: {
            getIdToken: mockGetIdToken,
        },
    })),
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("apiRequest", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetIdToken.mockResolvedValue("test-token");
        mockIsEmulatorEnabled = false;
        mockEnv.VITE_FIREBASE_PROJECT_ID = "test-project";
        mockEnv.VITE_API_PROJECT_ID = "";
    });

    describe("successful requests", () => {
        it("makes authenticated API request with correct headers", async () => {
            jest.resetModules();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({ data: "test" }),
            });

            const { apiRequest } = await import("@/lib/api-client");
            const result = await apiRequest("/test-endpoint");

            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining("/test-endpoint"),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        Authorization: "Bearer test-token",
                    }),
                }),
            );
            expect(result).toEqual({ data: "test" });
        });

        it("merges custom headers with default headers", async () => {
            jest.resetModules();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");
            await apiRequest("/test", {
                headers: { "X-Custom-Header": "custom-value" },
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    headers: expect.objectContaining({
                        "Content-Type": "application/json",
                        Authorization: "Bearer test-token",
                        "X-Custom-Header": "custom-value",
                    }),
                }),
            );
        });

        it("passes through request options like method and body", async () => {
            jest.resetModules();
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");
            await apiRequest("/test", {
                method: "POST",
                body: JSON.stringify({ data: "test" }),
            });

            expect(mockFetch).toHaveBeenCalledWith(
                expect.any(String),
                expect.objectContaining({
                    method: "POST",
                    body: JSON.stringify({ data: "test" }),
                }),
            );
        });
    });

    describe("URL configuration", () => {
        it("uses emulator URL when emulator is enabled", async () => {
            mockIsEmulatorEnabled = true;
            jest.resetModules();

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");
            await apiRequest("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                "http://localhost:5001/demo-sentient-archive/us-central1/test",
                expect.any(Object),
            );
        });

        it("uses production URL when emulator is disabled", async () => {
            mockIsEmulatorEnabled = false;
            mockEnv.VITE_FIREBASE_PROJECT_ID = "my-project";
            jest.resetModules();

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");
            await apiRequest("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                "https://us-central1-my-project.cloudfunctions.net/test",
                expect.any(Object),
            );
        });

        it("uses VITE_API_PROJECT_ID when provided", async () => {
            mockIsEmulatorEnabled = false;
            mockEnv.VITE_FIREBASE_PROJECT_ID = "my-project";
            mockEnv.VITE_API_PROJECT_ID = "api-project";
            jest.resetModules();

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");
            await apiRequest("/test");

            expect(mockFetch).toHaveBeenCalledWith(
                "https://us-central1-api-project.cloudfunctions.net/test",
                expect.any(Object),
            );
        });
    });

    describe("error handling", () => {
        it("throws error when user is not authenticated", async () => {
            jest.resetModules();
            const { getAuth } = await import("firebase/auth");
            (getAuth as jest.Mock).mockReturnValueOnce({ currentUser: null });

            const { apiRequest } = await import("@/lib/api-client");

            await expect(apiRequest("/test")).rejects.toThrow(
                "Not authenticated",
            );
        });

        it("throws error with message from API response", async () => {
            jest.resetModules();
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: jest
                    .fn()
                    .mockResolvedValue({ error: { message: "Custom error" } }),
            });

            const { apiRequest } = await import("@/lib/api-client");

            await expect(apiRequest("/test")).rejects.toThrow("Custom error");
        });

        it("throws generic error when API response has no error message", async () => {
            jest.resetModules();
            mockFetch.mockResolvedValueOnce({
                ok: false,
                json: jest.fn().mockResolvedValue({}),
            });

            const { apiRequest } = await import("@/lib/api-client");

            await expect(apiRequest("/test")).rejects.toThrow(
                "API request failed",
            );
        });
    });
});
