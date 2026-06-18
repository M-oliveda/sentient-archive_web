import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types/user";

describe("authStore", () => {
    beforeEach(() => {
        useAuthStore.setState({
            user: null,
            isLoading: true,
            isAuthenticated: false,
        });
    });

    it("should initialize with default state", () => {
        const state = useAuthStore.getState();

        expect(state.user).toBeNull();
        expect(state.isLoading).toBe(true);
        expect(state.isAuthenticated).toBe(false);
    });

    it("should set user and update authentication state", () => {
        const mockUser: User = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            photoURL: null,
            role: "client",
            isActive: true,
            tokenBalance: 20,
        };

        useAuthStore.getState().setUser(mockUser);

        const state = useAuthStore.getState();
        expect(state.user).toEqual(mockUser);
        expect(state.isLoading).toBe(false);
        expect(state.isAuthenticated).toBe(true);
    });

    it("should clear user on logout", () => {
        const mockUser: User = {
            uid: "test-uid",
            email: "test@example.com",
            displayName: "Test User",
            photoURL: null,
            role: "client",
            isActive: true,
            tokenBalance: 20,
        };

        useAuthStore.getState().setUser(mockUser);
        useAuthStore.getState().logout();

        const state = useAuthStore.getState();
        expect(state.user).toBeNull();
        expect(state.isAuthenticated).toBe(false);
    });

    it("should update loading state", () => {
        useAuthStore.getState().setLoading(false);

        const state = useAuthStore.getState();
        expect(state.isLoading).toBe(false);
    });
});
