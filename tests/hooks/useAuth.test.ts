import { act, renderHook, waitFor } from "@testing-library/react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/hooks/useAuth";
import { useAuthStore } from "@/stores/authStore";

jest.mock("firebase/auth");
jest.mock("firebase/firestore");
jest.mock("@/lib/firebase", () => ({
    auth: {},
    db: {},
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
});
