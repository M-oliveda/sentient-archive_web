import { act, renderHook, waitFor } from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";
import { authService } from "@/lib/auth-service";

jest.mock("firebase/auth");
jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({
    auth: {},
    db: {},
}));
jest.mock("@/lib/auth-service", () => ({
    authService: {
        handleGoogleRedirectResult: jest.fn().mockResolvedValue(undefined),
    },
}));

describe("useAuth", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });
    });

    it("should set user when Firebase user is authenticated", async () => {
        const mockFirebaseUser = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            photoURL: null,
        };

        const mockUserData = {
            role: "client",
            isActive: true,
            tokenBalance: 20,
        };

        let authCallback: ((user: unknown) => void) | undefined;

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            authCallback = callback;
            return jest.fn();
        });

        (getDoc as jest.Mock).mockResolvedValue({
            data: () => mockUserData,
        });

        (doc as jest.Mock).mockReturnValue({});

        renderHook(() => useAuth());

        await act(async () => {
            authCallback?.(mockFirebaseUser);
        });

        await waitFor(() => {
            const state = useAuthStore.getState();
            expect(state.user).toBeTruthy();
            expect(state.user?.email).toBe("test@example.com");
        });
    });

    it("should use Firestore fallbacks when Firebase profile fields are missing", async () => {
        const mockFirebaseUser = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: null,
            photoURL: null,
        };

        let authCallback: ((user: unknown) => void) | undefined;

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            authCallback = callback;
            return jest.fn();
        });

        (getDoc as jest.Mock).mockResolvedValue({
            data: () => ({
                displayName: "Stored Name",
                photoURL: "https://example.com/avatar.png",
            }),
        });

        (doc as jest.Mock).mockReturnValue({});

        renderHook(() => useAuth());

        await act(async () => {
            authCallback?.(mockFirebaseUser);
        });

        await waitFor(() => {
            const state = useAuthStore.getState();
            expect(state.user).toEqual({
                uid: "test-uid",
                email: "test@example.com",
                displayName: "Stored Name",
                photoURL: "https://example.com/avatar.png",
                role: "client",
                isActive: true,
                tokenBalance: 0,
            });
        });
    });

    it("should use null profile fields when Firebase and Firestore values are missing", async () => {
        const mockFirebaseUser = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: null,
            photoURL: null,
        };

        let authCallback: ((user: unknown) => void) | undefined;

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            authCallback = callback;
            return jest.fn();
        });

        (getDoc as jest.Mock).mockResolvedValue({
            data: () => ({}),
        });

        (doc as jest.Mock).mockReturnValue({});

        renderHook(() => useAuth());

        await act(async () => {
            authCallback?.(mockFirebaseUser);
        });

        await waitFor(() => {
            const state = useAuthStore.getState();
            expect(state.user?.displayName).toBeNull();
            expect(state.user?.photoURL).toBeNull();
        });
    });

    it("should logout when Firebase user is null", async () => {
        let authCallback: ((user: unknown) => void) | undefined;

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            authCallback = callback;
            return jest.fn();
        });

        renderHook(() => useAuth());

        act(() => {
            authCallback?.(null);
        });

        await waitFor(() => {
            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
        });
    });

    it("should logout when fetching user data fails", async () => {
        const mockFirebaseUser = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            photoURL: null,
        };

        let authCallback: ((user: unknown) => void) | undefined;
        const consoleErrorSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});

        (onAuthStateChanged as jest.Mock).mockImplementation((_auth, callback) => {
            authCallback = callback;
            return jest.fn();
        });

        (getDoc as jest.Mock).mockRejectedValue(new Error("Firestore unavailable"));
        (doc as jest.Mock).mockReturnValue({});

        renderHook(() => useAuth());

        await act(async () => {
            authCallback?.(mockFirebaseUser);
        });

        await waitFor(() => {
            const state = useAuthStore.getState();
            expect(state.user).toBeNull();
            expect(state.isAuthenticated).toBe(false);
            expect(consoleErrorSpy).toHaveBeenCalled();
        });

        consoleErrorSpy.mockRestore();
    });

    it("should unsubscribe on unmount", () => {
        const unsubscribe = jest.fn();

        (onAuthStateChanged as jest.Mock).mockImplementation(() => unsubscribe);

        const { unmount } = renderHook(() => useAuth());
        unmount();

        expect(unsubscribe).toHaveBeenCalled();
    });

    it("should call handleGoogleRedirectResult on mount", () => {
        (onAuthStateChanged as jest.Mock).mockImplementation(() => jest.fn());

        renderHook(() => useAuth());

        expect(authService.handleGoogleRedirectResult).toHaveBeenCalled();
    });
});
